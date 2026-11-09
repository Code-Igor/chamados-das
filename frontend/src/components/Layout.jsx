import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Tag, Wrench, Ticket, Menu, X, LifeBuoy, Plus } from 'lucide-react';

const menu = [
  { to: '/', text: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/clientes', text: 'Clientes', icon: Users },
  { to: '/categorias', text: 'Categorias', icon: Tag },
  { to: '/tecnicos', text: 'Técnicos', icon: Wrench },
  { to: '/chamados', text: 'Chamados', icon: Ticket },
];

export default function Layout({ children }) {
  const [aberto, setAberto] = useState(false);
  const location = useLocation();
  const current = menu.find((item) => item.end ? location.pathname === item.to : location.pathname.startsWith(item.to))?.text || 'ServiceDesk';

  return <div className="shell">
    {aberto && <div className="mobile-overlay" onClick={() => setAberto(false)} />}
    <aside className={`sidebar ${aberto ? 'sidebar-open' : ''}`}>
      <Link to="/" className="brand" onClick={() => setAberto(false)}>
        <span className="brand-icon"><LifeBuoy size={25} /></span>
        <span><strong>ServiceDesk</strong><small>CENTRAL DE SUPORTE</small></span>
      </Link>
      <div className="nav-caption">MENU PRINCIPAL</div>
      <nav className="nav-links" aria-label="Navegação principal">
        {menu.map(({ to, text, icon: Icon, end }) => <NavLink key={to} to={to} end={end}
          onClick={() => setAberto(false)}
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Icon size={19} strokeWidth={1.9} /><span>{text}</span>
        </NavLink>)}
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-tip"><strong>Organize seus atendimentos</strong><span>Gerencie clientes, equipes e chamados em um só lugar.</span></div><small>Projeto acadêmico • Spring Boot + React</small></div>
    </aside>
    <div className="main-shell">
      <header className="topbar">
        <div className="top-left">
          <button type="button" className="icon-button mobile-menu" onClick={() => setAberto(!aberto)} aria-label="Abrir menu">{aberto ? <X /> : <Menu />}</button>
          <span className="breadcrumb">Área de trabalho <span>/</span> <strong>{current}</strong></span>
        </div>
        <div className="top-actions"><span className="environment"><span className="status-dot" /> Ambiente local</span><Link className="button button-primary button-sm" to="/chamados/novo"><Plus size={16} /> Novo chamado</Link></div>
      </header>
      <main className="content">{children}</main>
    </div>
  </div>;
}
