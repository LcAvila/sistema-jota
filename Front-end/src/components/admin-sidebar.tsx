import React from "react";
import { Menu } from "antd";
import { HomeOutlined, SettingOutlined, AppstoreOutlined, BarChartOutlined, SolutionOutlined, DatabaseOutlined } from "@ant-design/icons";
import Link from "next/link";

const items = [
  {
    key: "/admin",
    icon: <HomeOutlined />,
    label: <Link href="/admin">Dashboard</Link>,
  },
  {
    key: "/admin/produtos",
    icon: <AppstoreOutlined />,
    label: <Link href="/admin/produtos">Produtos</Link>,
  },
  {
    key: "/admin/estoque",
    icon: <DatabaseOutlined />,
    label: <Link href="/admin/estoque">Estoque</Link>,
  },
  {
    key: "/admin/relatorios",
    icon: <BarChartOutlined />,
    label: <Link href="/admin/relatorios">Relatórios</Link>,
  },
  {
    key: "/admin/vendas-importar",
    icon: <SolutionOutlined />,
    label: <Link href="/admin/vendas-importar">Registro de Vendas</Link>,
  },
  {
    key: "/admin/configuracoes",
    icon: <SettingOutlined />,
    label: <Link href="/admin/configuracoes">Configurações</Link>,
  },
];

export function AdminSidebar({ selectedKey }: { selectedKey?: string }) {
  return (
    <Menu
      mode="inline"
      defaultSelectedKeys={[selectedKey || "/admin"]}
      style={{ height: "100%", borderRight: 0 }}
      items={items}
      theme="light"
    />
  );
}
