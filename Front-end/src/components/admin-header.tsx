import React from "react";
import { Avatar, Dropdown, Space, Typography } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";

const { Text } = Typography;

const items = [
  {
    key: "logout",
    label: (
      <span style={{ color: "#f5222d" }}>
        <LogoutOutlined /> Sair
      </span>
    ),
  },
];

export function AdminHeader({ username = "Admin" }: { username?: string }) {
  return (
    <div className="flex items-center justify-between px-4 h-full">
      <Text strong className="text-lg">Área Administrativa</Text>
      <Dropdown menu={{ items }} placement="bottomRight">
        <Space>
          <Avatar size="large" icon={<UserOutlined />} />
          <span className="hidden md:inline">{username}</span>
        </Space>
      </Dropdown>
    </div>
  );
}
