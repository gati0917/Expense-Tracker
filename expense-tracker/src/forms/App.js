import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import UserForm from './UserForm';
import ExpenseForm from './ExpenseForm';
import CategoryForm from './CategoryForm';
import '../styles/App.css';

const { Header, Content, Footer } = Layout;

function App() {
  const [activeTab, setActiveTab] = useState('user');

  return (
    <Layout className="App">
      <Header className="app-header-bar">
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[activeTab]}
          onClick={(e) => setActiveTab(e.key)}
          items={[
            { key: 'user', label: 'Add User' },
            { key: 'expense', label: 'Add Expense' },
            { key: 'category', label: 'Add Category' }
          ]}
        />
      </Header>
      <Content style={{ padding: '20px' }}>
        {activeTab === 'user' && <UserForm />}
        {activeTab === 'expense' && <ExpenseForm />}
        {activeTab === 'category' && <CategoryForm />}
      </Content>
      <Footer className="app-footer" style={{ textAlign: 'center' }}>
        &copy; {new Date().getFullYear()} Expense Tracker. All rights reserved.
      </Footer>
    </Layout>
  );
}

export default App;
