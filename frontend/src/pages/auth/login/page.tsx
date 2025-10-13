
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/base/Button';
import Input from '../../../components/base/Input';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('로그인 데이터:', formData);
    alert('로그인 되었습니다!');
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} 소셜 로그인`);
    alert(`${provider} 로그인이 시작됩니다.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">로그인</h2>
          <p className="mt-2 text-gray-600">계정에 로그인하세요</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="이메일"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="example@email.com"
              required
            />

            <Input
              label="비밀번호"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-600">로그인 상태 유지</span>
              </label>
              
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer">
                비밀번호 찾기
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg">
              로그인
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button 
                onClick={() => handleSocialLogin('Google')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
              >
                <i className="ri-google-fill text-red-500 text-lg"></i>
                <span className="ml-2">Google</span>
              </button>
              
              <button 
                onClick={() => handleSocialLogin('Kakao')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
              >
                <i className="ri-kakao-talk-fill text-yellow-500 text-lg"></i>
                <span className="ml-2">Kakao</span>
              </button>

              <button 
                onClick={() => handleSocialLogin('Naver')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
              >
                <i className="ri-naver-fill text-green-500 text-lg"></i>
                <span className="ml-2">Naver</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-500 cursor-pointer">
                회원가입하기
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
