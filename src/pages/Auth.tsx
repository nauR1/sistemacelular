import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Auth() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setError('Conta criada com sucesso! Você já pode fazer login.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (err) {
      if (err instanceof Error) {
        // Traduzir mensagens de erro comuns
        const errorMessage = err.message.toLowerCase();
        if (errorMessage.includes('invalid login credentials')) {
          setError('Email ou senha incorretos');
        } else if (errorMessage.includes('email already registered')) {
          setError('Este email já está registrado');
        } else if (errorMessage.includes('password')) {
          setError('A senha deve ter pelo menos 6 caracteres');
        } else {
          setError(err.message);
        }
      } else {
        setError('Ocorreu um erro inesperado');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Wrench className="w-12 h-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          TechAssist
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSignUp ? 'Crie sua conta' : 'Entre na sua conta'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className={`mb-4 ${
              error.includes('sucesso') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            } border rounded-md p-4`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className={`h-5 w-5 ${
                    error.includes('sucesso') ? 'text-green-400' : 'text-red-400'
                  }`} aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${
                    error.includes('sucesso') ? 'text-green-700' : 'text-red-700'
                  }`}>{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isSignUp ? 'Criando conta...' : 'Entrando...'}
                  </div>
                ) : (
                  isSignUp ? 'Criar conta' : 'Entrar'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="w-full text-center text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isSignUp
                ? 'Já tem uma conta? Entre aqui'
                : 'Não tem uma conta? Cadastre-se'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}