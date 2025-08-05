import React, { useState, useEffect } from 'react';
import {
  Form, Input, Select, Button, DatePicker, InputNumber,
  message, Card, Table, Modal, Row, Col
} from 'antd';
import moment from 'moment';
import '../styles/ExpenseForm.css';

function ExpenseForm({ onExpenseCreated }) {
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editForm] = Form.useForm();
  const [form] = Form.useForm();

  const [editingExpense, setEditingExpense] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const now = moment();
  const [month, setMonth] = useState(String(now.month() + 1));
  const [year, setYear] = useState(String(now.year()));
  const [expensesLoading, setExpensesLoading] = useState(true);

  const fetchExpenses = async (selectedYear = year, selectedMonth = month) => {
    setExpensesLoading(true);
    try {
      const res = await fetch(`/expenses?year=${selectedYear}&month=${selectedMonth}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      } else {
        message.error('Failed to fetch expenses');
      }
    } catch {
      message.error('Error fetching expenses');
    }
    setExpensesLoading(false);
  };

  const fetchCategories = () => {
    fetch('/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  };

  useEffect(() => {
    fetch('/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => message.error('Could not load users'));

    fetchExpenses();
    fetchCategories();
  }, []);

  const handleSubmit = async (values) => {
    console.log('Add expense form values...:', values);
    try {
      const payload = {
        name: values.name,
        amount: values.amount,
        month: values.date.month() + 1,
        year: values.date.year(),
        user: { id: values.userId },
        category: { id: values.categoryId }
      };

      const response = await fetch('/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        message.success('Expense created successfully');
        form.resetFields();
        await fetchExpenses();
        onExpenseCreated && onExpenseCreated();
      } else {
        message.error('Failed to create expense');
        const errorText = await response.text();
        console.log('Add expense error response:', errorText);
      }
    } catch (err) {
      message.error('Error creating expense');
      console.log('Add expense exception:', err);
    }
  };

  const handleSubmitFailed = ({ errorFields }) => {
    message.error('Please fill all required fields');
    console.warn('Validation Errors:', errorFields);
  };

  const handleDateChange = (date, dateString) => {
    if (date && date.isValid()) {
      const selectedYear = date.year();
      const selectedMonth = date.month() + 1;
      setYear(String(selectedYear));
      setMonth(String(selectedMonth));
      fetchExpenses(selectedYear, selectedMonth);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/expenses/${id}`, { method: 'DELETE' });
      if (response.ok) {
        message.success('Expense deleted');
        fetchExpenses();
      } else {
        message.error('Failed to delete expense');
      }
    } catch {
      message.error('Error deleting expense');
    }
  };

  const handleEdit = async (expense) => {
    setEditingExpense(expense);
    setEditModalVisible(true);
    setTimeout(() => {
      editForm.setFieldsValue({
        name: expense.name,
        amount: expense.amount,
        categoryId: expense.category?.id,
        userId: expense.user?.id,
        date: moment({ year: expense.year, month: expense.month - 1 }),
      });
    }, 0);
  };

  const handleEditSubmit = async (values) => {
    try {
      const response = await fetch(`/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingExpense,
          name: values.name,
          amount: values.amount,
          month: values.date.month() + 1,
          year: values.date.year(),
          user: { id: values.userId },
          category: { id: values.categoryId }
        })
      });

      if (response.ok) {
        message.success('Expense updated');
        setEditModalVisible(false);
        setEditingExpense(null);
        fetchExpenses();
      } else {
        message.error('Failed to update expense');
      }
    } catch {
      message.error('Error updating expense');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'User', dataIndex: ['user', 'username'], key: 'user' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount' },
    {
      title: 'Month', dataIndex: 'month', key: 'month',
      render: (m) => ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m]
    },
    { title: 'Year', dataIndex: 'year', key: 'year' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Row gutter={24} style={{ width: '100%', margin: 0 }}>
        <Col span={17}>
          <h3 className="registered-expenses-title">Registered Expenses</h3>
          {(() => {
            const filteredExpenses = expenses.filter(exp => exp.month === Number(month) && exp.year === Number(year));
            if (expensesLoading) {
              return null;
            }
            if (filteredExpenses.length === 0) {
              return (
                <div style={{ margin: '24px 0', color: '#d46b08', fontWeight: 'bold', fontSize: '16px' }}>
                  No expenses added for the selected month ({moment(month, 'M').format('MMM')} - {year}). Please add expense or change month and year to see previously added expense.
                  <div style={{ marginTop: 16 }}>
                    <span style={{ marginRight: 8 }}>Select Month & Year:</span>
                    <DatePicker
                      picker="month"
                      style={{ width: 180 }}
                      onChange={handleDateChange}
                      defaultValue={moment(year + '-' + month, 'YYYY-M')}
                    />
                  </div>
                </div>
              );
            }
            return (
              <>
                <Table
                  className="registered-expenses-table"
                  columns={columns}
                  dataSource={filteredExpenses}
                  rowKey="id"
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 32 }}>
                  <div style={{ flex: 1, minWidth: 320 }}>
                    <h4 className="registered-expenses-title">Total Expense by User</h4>
                    <Table
                      className="total-expense-user-table"
                      columns={[
                        { title: 'User', dataIndex: 'user', key: 'user' },
                        { title: 'Total Expense', dataIndex: 'total', key: 'total' },
                      ]}
                      dataSource={Object.entries(
                        filteredExpenses.reduce((acc, exp) => {
                          const username = exp.user?.username || 'Unknown';
                          acc[username] = (acc[username] || 0) + Number(exp.amount);
                          return acc;
                        }, {})
                      ).map(([user, total]) => ({ user, total }))}
                      pagination={false}
                      rowKey="user"
                      summary={pageData => {
                        const total = pageData.reduce((sum, row) => sum + row.total, 0);
                        return (
                          <Table.Summary.Row>
                            <Table.Summary.Cell><b>All Users</b></Table.Summary.Cell>
                            <Table.Summary.Cell><b>{total}</b></Table.Summary.Cell>
                          </Table.Summary.Row>
                        );
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 320 }}>
                    <h4 className="registered-expenses-title">Total Expense by Category</h4>
                    <Table
                      className="total-expense-category-table"
                      columns={[
                        { title: 'Category', dataIndex: 'category', key: 'category' },
                        { title: 'Total Expense', dataIndex: 'total', key: 'total' },
                      ]}
                      dataSource={Object.entries(
                        filteredExpenses.reduce((acc, exp) => {
                          const category = exp.category?.name || 'Unknown';
                          acc[category] = (acc[category] || 0) + Number(exp.amount);
                          return acc;
                        }, {})
                      ).map(([category, total]) => ({ category, total }))}
                      pagination={false}
                      rowKey="category"
                      summary={pageData => {
                        const total = pageData.reduce((sum, row) => sum + row.total, 0);
                        return (
                          <Table.Summary.Row>
                            <Table.Summary.Cell><b>All Categories</b></Table.Summary.Cell>
                            <Table.Summary.Cell><b>{total}</b></Table.Summary.Cell>
                          </Table.Summary.Row>
                        );
                      }}
                    />
                  </div>
                </div>
              </>
            );
          })()}
        </Col>
        <Col span={7}>
          <Card title="Add Expense" style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              onFinishFailed={handleSubmitFailed}
              initialValues={{ date: moment() }}
            >
              <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter a expense name' }]}> 
                <Input />
              </Form.Item>
              <Form.Item label="Amount" name="amount" rules={[{ required: true, message: 'Please enter a expense amount' }]}> 
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Category" name="categoryId" rules={[{ required: true }]}>
                <Select placeholder="Select category">
                  {categories.map(c => (
                    <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Date" name="date" rules={[{ required: true }]}> 
                <DatePicker picker="month" style={{ width: '100%' }} onChange={handleDateChange} />
              </Form.Item>
              <Form.Item label="User" name="userId" rules={[{ required: true }]}>
                <Select placeholder="Select user">
                  {users.map(user => (
                    <Select.Option key={user.id} value={user.id}>{user.username}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">Submit</Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Edit Expense"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingExpense(null);
          editForm.resetFields();
        }}
        footer={null}
        destroyOnHidden
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
            <Select>
              {categories.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker picker="month" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="userId" label="User" rules={[{ required: true }]}>
            <Select>
              {users.map(u => (
                <Select.Option key={u.id} value={u.id}>{u.username}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Update</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default ExpenseForm;
