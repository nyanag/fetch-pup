import { Form, Input, Button } from 'antd';
import { useState } from 'react';

interface LoginFormProps {
  apiUrl: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ apiUrl }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const response = await fetch(apiUrl + 'auth/login', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(values),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        window.location.href = '/search'; // Redirect to search page on success
      } else {
        throw new Error('Failed to login');
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <Form onFinish={onFinish}>
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Login
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
