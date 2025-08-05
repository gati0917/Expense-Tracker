import React, { useState, useEffect } from 'react';
import { Form, Input, Button, List, message, Card, Row, Col, Modal, Popconfirm } from 'antd';
import '../styles/CategoryForm.css';

function CategoryForm({ onCategoryCreated }) {
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();
  const [editingCategory, setEditingCategory] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();

  const fetchCategories = () => {
    fetch('/categories')
      .then(res => res.json())
        .then(data => setCategories(data));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (values) => {
    try {
      const response = await fetch('/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: values.name })
      });
      if (response.ok) {
        message.success('Category added successfully');
        form.resetFields();
        fetchCategories();
        onCategoryCreated && onCategoryCreated();
      } else {
        message.error('Failed to add category');
      }
    } catch (error) {
      message.error('Error adding category');
    }
  };

  const handleEdit = async (category) => {
    setEditingCategory(category);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      const response = await fetch(`/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: values.name })
      });
      if (response.ok) {
        message.success('Category updated successfully');
        setEditModalVisible(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        message.error('Failed to update category');
      }
    } catch (error) {
      message.error('Error updating category');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/categories/${id}`, { method: 'DELETE' });
      if (response.ok) {
        message.success('Category deleted successfully');
        fetchCategories();
      } else {
        message.error('Failed to delete category');
      }
    } catch (error) {
      message.error('Error deleting category');
    }
  };

  useEffect(() => {
    if (editModalVisible && editingCategory) {
      editForm.setFieldsValue({ name: editingCategory.name });
    }
  }, [editModalVisible, editingCategory, editForm]);

  return (
      <Row gutter={24} style={{ width: '100%', margin: 0 }}>
        <Col span={17}>
          <h3>Existing Categories</h3>
          <List
              bordered
              dataSource={categories}
              renderItem={item => (
                  <List.Item
                      actions={[
                        <a key="edit" onClick={() => handleEdit(item)}>Edit</a>,
                        <Popconfirm
                            key="delete"
                            title="Are you sure to delete this category?"
                            onConfirm={() => handleDelete(item.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                          <a style={{ color: 'red' }}>Delete</a>
                        </Popconfirm>
                      ]}
                  >
                    {item.name}
                  </List.Item>
              )}
          />
        </Col>
        <Col span={7}>
          <Card
              title="Add Category"
              style={{
                width: '100%',
                maxWidth: 400,
                margin: '0 auto',
                borderRadius: '12px',
                backgroundColor: '#ffffff'
              }}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                  label="Category Name"
                  name="name"
                  rules={[{ required: true, message: 'Please enter a category name' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">Add Category</Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Modal
            title="Edit Category"
            open={editModalVisible}
            onCancel={() => {
              setEditModalVisible(false);
              setEditingCategory(null);
              editForm.resetFields();
            }}
            footer={null}
        >
          <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
            <Form.Item
                label="Category Name"
                name="name"
                rules={[{ required: true, message: 'Please enter a category name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Update</Button>
            </Form.Item>
          </Form>
        </Modal>
      </Row>
  );
}

export default CategoryForm;
