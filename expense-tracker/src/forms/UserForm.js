import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Table, message, Popconfirm, Card, Row, Col, Modal } from 'antd';
import '../styles/UserForm.css';

function UserForm({ onUserCreated }) {
  // State declarations
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (editModalVisible && editingUser) {
      editForm.setFieldsValue({
        username: editingUser.username,
        mobileNumber: editingUser.mobileNumber
      });
    }
  }, [editModalVisible, editingUser, editForm]);

  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      const response = await fetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (response.ok) {
        message.success('User added successfully');
        form.resetFields();
        fetchUsers();
        onUserCreated && onUserCreated();
      } else {
        message.error('Failed to add user');
      }
    } catch (error) {
      console.error(error);
      message.error('Error adding user');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(`/users/${userId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        message.success('User deleted successfully');
        fetchUsers();
      } else {
        message.error('Failed to delete user');
      }
    } catch (error) {
      message.error('Error deleting user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      const response = await fetch(`/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (response.ok) {
        message.success('User updated successfully');
        setEditModalVisible(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        message.error('Failed to update user');
      }
    } catch (error) {
      message.error('Error updating user');
    }
  };

  const columns = [
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Mobile Number', dataIndex: 'mobileNumber', key: 'mobileNumber' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </>
      )
    }
  ];

  return (
    <Row gutter={24} style={{ width: '100%', margin: 0 }}>
      <Col span={17}>
        <h3>Existing Users</h3>
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
          style={{ marginTop: '20px', width: '100%' }}
        />
      </Col>
      <Col span={7}>
        <Card
          title="Add User"
          style={{ width: '100%', maxWidth: 400, margin: '0 auto', borderRadius: '12px', backgroundColor: '#ffffff' }}
        >
          {/* Add User Form */}
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please enter a username' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Mobile Number"
              name="mobileNumber"
              rules={[{ required: true, message: 'Please enter a mobile number' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={submitLoading}>
                Add User
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>

      <Modal
        title="Edit User"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingUser(null);
          editForm.resetFields();
        }}
        footer={null}
        destroyOnHidden
      >
        {/* Edit User Modal Form */}
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please enter a username' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mobile Number"
            name="mobileNumber"
            rules={[{ required: true, message: 'Please enter a mobile number' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );
}

export default UserForm;
