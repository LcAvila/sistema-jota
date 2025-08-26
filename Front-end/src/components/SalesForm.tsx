"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Trash2, Save, ShoppingCart, User, CreditCard } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  sku: string;
}

interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PaymentMethod {
  id: number;
  name: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
}

interface SaleFormData {
  clientId: number;
  sellerId: number;
  items: SaleItem[];
  paymentMethodId: number;
  total: number;
  notes?: string;
}

export default function SalesForm({ onSaleCreated }: { onSaleCreated?: (sale: any) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [sellers, setSellers] = useState<Client[]>([]);
  
  const [saleData, setSaleData] = useState<SaleFormData>({
    clientId: 0,
    sellerId: 0,
    items: [],
    paymentMethodId: 0,
    total: 0,
    notes: ''
  });

  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  // Calcular total sempre que os itens mudarem
  useEffect(() => {
    const total = saleData.items.reduce((sum, item) => sum + item.total, 0);
    setSaleData(prev => ({ ...prev, total }));
  }, [saleData.items]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, clientsRes, paymentMethodsRes, sellersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/users?role=client'),
        fetch('/api/payment-methods'),
        fetch('/api/users?role=seller')
      ]);

      const [productsData, clientsData, paymentMethodsData, sellersData] = await Promise.all([
        productsRes.json(),
        clientsRes.json(),
        paymentMethodsRes.json(),
        sellersRes.json()
      ]);

      setProducts(productsData);
      setClients(clientsData);
      setPaymentMethods(paymentMethodsData);
      setSellers(sellersData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product || quantity <= 0) return;

    if (quantity > product.stock) {
      alert(`Estoque insuficiente. Disponível: ${product.stock}`);
      return;
    }

    const existingItemIndex = saleData.items.findIndex(item => item.productId === selectedProduct);
    
    if (existingItemIndex >= 0) {
      // Atualizar item existente
      const updatedItems = [...saleData.items];
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        alert(`Estoque insuficiente. Disponível: ${product.stock}`);
        return;
      }

      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQuantity,
        total: newQuantity * product.price
      };
      
      setSaleData(prev => ({ ...prev, items: updatedItems }));
    } else {
      // Adicionar novo item
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        total: quantity * product.price
      };
      
      setSaleData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }

    setSelectedProduct(0);
    setQuantity(1);
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(index);
      return;
    }

    const item = saleData.items[index];
    const product = products.find(p => p.id === item.productId);
    
    if (product && newQuantity > product.stock) {
      alert(`Estoque insuficiente. Disponível: ${product.stock}`);
      return;
    }

    const updatedItems = [...saleData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: newQuantity,
      total: newQuantity * updatedItems[index].unitPrice
    };
    
    setSaleData(prev => ({ ...prev, items: updatedItems }));
  };

  const removeItem = (index: number) => {
    const updatedItems = saleData.items.filter((_, i) => i !== index);
    setSaleData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = async () => {
    if (!saleData.clientId || !saleData.sellerId || !saleData.paymentMethodId || saleData.items.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        const newSale = await response.json();
        alert('Venda registrada com sucesso!');
        
        // Reset form
        setSaleData({
          clientId: 0,
          sellerId: 0,
          items: [],
          paymentMethodId: 0,
          total: 0,
          notes: ''
        });

        onSaleCreated?.(newSale);
      } else {
        const error = await response.json();
        alert(`Erro ao registrar venda: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      alert('Erro ao registrar venda. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p>Carregando dados...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Registro de Venda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações da Venda */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Cliente *
              </label>
              <Select value={saleData.clientId.toString()} onValueChange={(value) => setSaleData(prev => ({ ...prev, clientId: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vendedor *</label>
              <Select value={saleData.sellerId.toString()} onValueChange={(value) => setSaleData(prev => ({ ...prev, sellerId: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map(seller => (
                    <SelectItem key={seller.id} value={seller.id.toString()}>
                      {seller.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Forma de Pagamento *
              </label>
              <Select value={saleData.paymentMethodId.toString()} onValueChange={(value) => setSaleData(prev => ({ ...prev, paymentMethodId: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(method => (
                    <SelectItem key={method.id} value={method.id.toString()}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Adicionar Produtos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Adicionar Produtos</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Produto</label>
                <Select value={selectedProduct.toString()} onValueChange={(value) => setSelectedProduct(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - R$ {product.price.toFixed(2)} (Estoque: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quantidade</label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Preço Unitário</label>
                <Input
                  value={selectedProduct ? `R$ ${products.find(p => p.id === selectedProduct)?.price.toFixed(2) || '0,00'}` : 'R$ 0,00'}
                  disabled
                />
              </div>

              <Button onClick={addItem} disabled={!selectedProduct} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          <Separator />

          {/* Lista de Itens */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Itens da Venda</h3>
            {saleData.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum item adicionado
              </div>
            ) : (
              <div className="space-y-2">
                {saleData.items.map((item, index) => (
                  <motion.div
                    key={`${item.productId}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productName}</h4>
                      <p className="text-sm text-gray-600">
                        R$ {item.unitPrice.toFixed(2)} x {item.quantity} = R$ {item.total.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateItemQuantity(index, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <span className="w-12 text-center">{item.quantity}</span>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateItemQuantity(index, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Observações</label>
            <textarea
              className="w-full p-3 border rounded-lg resize-none"
              rows={3}
              placeholder="Observações sobre a venda..."
              value={saleData.notes}
              onChange={(e) => setSaleData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <Separator />

          {/* Total e Ações */}
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total da Venda</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {saleData.total.toFixed(2)}
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || saleData.items.length === 0}
              className="bg-green-600 hover:bg-green-700 px-8 py-3"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? 'Salvando...' : 'Registrar Venda'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
