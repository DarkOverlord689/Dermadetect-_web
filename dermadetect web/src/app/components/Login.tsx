import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import logo from '@/path/to/logo.png'; // Asegúrate de cambiar esta ruta al logo correcto

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    userType: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación de usuarios locales
    const validUsers = {
      admin: 'admin123',
      user: 'user123'
    };

    if (validUsers[credentials.username] === credentials.password) {
      onLogin({ username: credentials.username, userType: credentials.userType });
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Inicio de Sesión</CardTitle>
        </CardHeader>
        <CardContent>
        <img src="/Color.png" alt="Logo" className="mb-16 mx-auto h-16 w-auto"  />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Usuario"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Contraseña"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full"
              />
            </div>
            <div className="flex space-x-4">
              <Button
                type="button"
                onClick={() => setCredentials({...credentials, userType: 'doctor'})}
                className={`w-1/2 ${credentials.userType === 'doctor' ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                Doctor
              </Button>
              <Button
                type="button"
                onClick={() => setCredentials({...credentials, userType: 'admin'})}
                className={`w-1/2 ${credentials.userType === 'admin' ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                Administrador
              </Button>
            </div>
            <Button type="submit" className="w-full">
              Ingresar
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
