import React from "react";
import { Layout, theme } from "antd";
import { cn } from "@/lib/utils";

const { Sider, Header, Content } = Layout;

interface AdminLayoutProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AdminLayout({
  sidebar,
  header,
  children,
  className
}: AdminLayoutProps) {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout className={cn("min-h-screen", className)}>
      {sidebar && (
        <Sider
          width={240}
          breakpoint="lg"
          collapsedWidth="0"
          style={{ background: colorBgContainer }}
        >
          {sidebar}
        </Sider>
      )}
      <Layout>
        {header && (
          <Header style={{ background: colorBgContainer, padding: 0 }}>
            {header}
          </Header>
        )}
        <Content className="p-4 md:p-8 bg-transparent">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
