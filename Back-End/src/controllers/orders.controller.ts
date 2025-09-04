import { Request, Response } from 'express';
import { sendPurchaseEvent } from '../utils/ga4';
import { supabaseAdmin } from '../utils/supabase';

// GET /api/orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            price,
            sku
          )
        ),
        order_logs (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pedidos:', error);
      return res.status(500).json({ message: 'Erro ao listar pedidos', details: error.message });
    }

    // Para cada pedido, buscar dados do cliente, vendedor e loja
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const [clientResult, sellerResult, storeResult] = await Promise.all([
          supabaseAdmin.from('users').select('id, name, email').eq('id', order.client_id).single(),
          supabaseAdmin.from('users').select('id, name, email').eq('id', order.seller_id).single(),
          supabaseAdmin.from('stores').select('id, name').eq('id', order.store_id).single()
        ]);

        return {
          ...order,
          clientId: order.client_id,
          sellerId: order.seller_id,
          storeId: order.store_id,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          items: order.order_items || [],
          logs: order.order_logs || [],
          client: clientResult.data || null,
          seller: sellerResult.data || null,
          store: storeResult.data || null
        };
      })
    );

    res.json(ordersWithDetails);
  } catch (err) {
    console.error('getAllOrders error', err);
    res.status(500).json({ message: 'Erro ao listar pedidos' });
  }
};

// GET /api/orders/:id
export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            price,
            sku
          )
        ),
        order_logs (*)
      `)
      .eq('id', Number(id))
      .single();

    if (error) {
      console.error('Erro ao buscar pedido:', error);
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    // Buscar dados do cliente, vendedor e loja
    const [clientResult, sellerResult, storeResult] = await Promise.all([
      supabaseAdmin.from('users').select('id, name, email').eq('id', order.client_id).single(),
      supabaseAdmin.from('users').select('id, name, email').eq('id', order.seller_id).single(),
      supabaseAdmin.from('stores').select('id, name').eq('id', order.store_id).single()
    ]);

    const orderWithDetails = {
      ...order,
      clientId: order.client_id,
      sellerId: order.seller_id,
      storeId: order.store_id,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: order.order_items || [],
      logs: order.order_logs || [],
      client: clientResult.data || null,
      seller: sellerResult.data || null,
      store: storeResult.data || null
    };

    res.json(orderWithDetails);
  } catch (err) {
    console.error('getOrderById error', err);
    res.status(500).json({ message: 'Erro ao buscar pedido' });
  }
};

// POST /api/orders
export const createOrder = async (req: Request, res: Response) => {
  const { clientId, sellerId, storeId, items, status = 'pending' } = req.body as {
    clientId: number; sellerId: number; storeId: number; items: Array<{ productId: number; qty: number; unitPrice: string; note?: string }>; status?: string;
  };
  
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Itens do pedido são obrigatórios' });
  }

  try {
    const total = items.reduce((sum, item) => sum + (item.qty * parseFloat(item.unitPrice)), 0);
    
    // Criar o pedido no Supabase
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        client_id: clientId,
        seller_id: sellerId,
        store_id: storeId,
        total,
        status
      })
      .select()
      .single();

    if (orderError) {
      console.error('Erro ao criar pedido:', orderError);
      return res.status(500).json({ message: 'Erro ao criar pedido', details: orderError.message });
    }

    // Criar os itens do pedido
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      qty: item.qty,
      unit_price: parseFloat(item.unitPrice),
      note: item.note || null
    }));

    const { data: createdItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)
      .select(`
        *,
        products (
          id,
          name,
          price,
          sku
        )
      `);

    if (itemsError) {
      console.error('Erro ao criar itens do pedido:', itemsError);
      // Se falhar ao criar itens, deletar o pedido criado
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return res.status(500).json({ message: 'Erro ao criar itens do pedido', details: itemsError.message });
    }

    // Criar log do pedido
    await supabaseAdmin
      .from('order_logs')
      .insert({
        order_id: order.id,
        action: 'created',
        by_user_id: sellerId,
        from_status: null,
        to_status: status
      });

    const orderWithDetails = {
      ...order,
      clientId: order.client_id,
      sellerId: order.seller_id,
      storeId: order.store_id,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: createdItems || []
    };

    // Send GA4 event
    try {
      await sendPurchaseEvent({
        clientId: 'test-client', // TODO: Get real client ID
        transaction_id: order.id.toString(),
        value: total,
        currency: 'BRL',
        items: items.map(item => ({
          item_id: item.productId.toString(),
          item_name: `Product ${item.productId}`,
          quantity: item.qty,
          price: parseFloat(item.unitPrice)
        }))
      });
    } catch (gaError) {
      console.warn('GA4 event failed:', gaError);
    }

    res.status(201).json(orderWithDetails);
  } catch (err) {
    console.error('createOrder error', err);
    res.status(500).json({ message: 'Erro ao criar pedido' });
  }
};

// PUT /api/orders/:id/status
export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, byUserId } = req.body;

  if (!status || !byUserId) {
    return res.status(400).json({ message: 'Status e byUserId são obrigatórios' });
  }

  try {
    // Buscar o pedido atual para obter o status anterior
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('status')
      .eq('id', Number(id))
      .single();

    if (fetchError) {
      console.error('Erro ao buscar pedido:', fetchError);
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    // Atualizar o status do pedido
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', Number(id))
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar pedido:', updateError);
      return res.status(500).json({ message: 'Erro ao atualizar status do pedido', details: updateError.message });
    }

    // Criar log da mudança de status
    await supabaseAdmin
      .from('order_logs')
      .insert({
        order_id: Number(id),
        action: 'status_changed',
        by_user_id: byUserId,
        from_status: currentOrder.status,
        to_status: status
      });

    res.json({
      id: updatedOrder.id,
      status: updatedOrder.status,
      updatedAt: updatedOrder.updated_at
    });
  } catch (err) {
    console.error('updateOrderStatus error', err);
    res.status(500).json({ message: 'Erro ao atualizar status do pedido' });
  }
};

// DELETE /api/orders/:id
export const deleteOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    // Primeiro, deletar os itens do pedido
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .delete()
      .eq('order_id', Number(id));

    if (itemsError) {
      console.error('Erro ao deletar itens do pedido:', itemsError);
      return res.status(500).json({ message: 'Erro ao deletar itens do pedido', details: itemsError.message });
    }

    // Deletar os logs do pedido
    const { error: logsError } = await supabaseAdmin
      .from('order_logs')
      .delete()
      .eq('order_id', Number(id));

    if (logsError) {
      console.error('Erro ao deletar logs do pedido:', logsError);
      return res.status(500).json({ message: 'Erro ao deletar logs do pedido', details: logsError.message });
    }

    // Finalmente, deletar o pedido
    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', Number(id));

    if (orderError) {
      console.error('Erro ao deletar pedido:', orderError);
      return res.status(500).json({ message: 'Erro ao deletar pedido', details: orderError.message });
    }

    res.status(204).send();
  } catch (err) {
    console.error('deleteOrder error', err);
    res.status(500).json({ message: 'Erro ao deletar pedido' });
  }
};