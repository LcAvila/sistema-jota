"use client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollText, Package, Ticket, LayoutGrid, Store, BarChart } from 'lucide-react';

const drawerWidth = 220;

const menuItems = [
  { id: 0, label: 'Dashboard', icon: BarChart },
  { id: 1, label: 'Pedidos', icon: ScrollText },
  { id: 2, label: 'Produtos', icon: Package },
  { id: 3, label: 'Promoções', icon: Ticket },
];

export default function SidebarAdmin({ tab, setTab }: { tab: number, setTab: (v: number) => void }) {
  return (
    <aside className="w-[220px] flex-shrink-0 bg-card text-card-foreground border-r flex flex-col">
      <div className="flex flex-col items-center py-4">
        <Avatar className="w-16 h-16 mb-1 bg-brand text-brand-foreground">
          <AvatarFallback className="text-2xl font-bold">JD</AvatarFallback>
        </Avatar>
        <h2 className="font-bold text-lg">Jota Admin</h2>
        <p className="text-sm text-muted-foreground">Painel Funcionário</p>
      </div>
      <hr className="border-border mb-1" />
      <nav className="flex flex-col gap-1 px-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={tab === item.id ? "secondary" : "ghost"}
              className="justify-start gap-2"
              onClick={() => setTab(item.id)}
            >
              <Icon className={`h-5 w-5 ${tab === item.id ? 'text-brand' : ''}`} />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </nav>
      <div className="flex-grow" />
      <hr className="border-border mt-2" />
      <div className="text-center py-2">
        <Store className="text-brand mx-auto mb-1" />
        <p className="text-xs text-muted-foreground">Jota Distribuidora<br/>Admin 2024</p>
      </div>
    </aside>
  );
}
