
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/base/Button';
import Input from '../../../components/base/Input';

export default function Signup() {
  const [userType, setUserType] = useState<'client' | 'freelancer'>('client');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    companyName: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('회원가입 데이터:', { userType, profileImage, ...formData });
    alert('회원가입이 완료되었습니다!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">회원가입</h2>
          <p className="mt-2 text-gray-600">새 계정을 만들어보세요</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {/* 프로필 이미지 업로드 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              프로필 이미지
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  <i className="ri-user-line text-2xl text-gray-400"></i>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-upload"
                />
                <label
                  htmlFor="profile-upload"
                  className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap"
                >
                  <i className="ri-camera-line mr-2"></i>
                  이미지 선택
                </label>
                {profileImage && (
                  <button
                    type="button"
                    onClick={() => setProfileImage(null)}
                    className="ml-2 text-sm text-red-600 hover:text-red-500 cursor-pointer"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 사용자 타입 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              회원 유형 선택 <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="client"
                  checked={userType === 'client'}
                  onChange={(e) => setUserType(e.target.value as 'client' | 'freelancer')}
                  className="sr-only"
                />
                <div className={`flex items-center justify-center w-full px-4 py-3 border rounded-lg transition-colors ${
                  userType === 'client' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}>
                  <i className="ri-building-line mr-2"></i>
                  클라이언트
                </div>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="freelancer"
                  checked={userType === 'freelancer'}
                  onChange={(e) => setUserType(e.target.value as 'client' | 'freelancer')}
                  className="sr-only"
                />
                <div className={`flex items-center justify-center w-full px-4 py-3 border rounded-lg transition-colors ${
                  userType === 'freelancer' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}>
                  <i className="ri-user-line mr-2"></i>
                  프리랜서
                </div>
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="이메일"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="example@email.com"
              required
            />

            <Input
              label="아이디"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="사용하실 아이디를 입력하세요"
              required
            />

            <Input
              label="비밀번호"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="8자 이상의 비밀번호"
              required
            />

            <Input
              label="비밀번호 확인"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />

            {userType === 'client' ? (
              <Input
                label="회사명"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="회사명을 입력하세요"
                required
              />
            ) : (
              <Input
                label="이름"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="실명을 입력하세요"
                required
              />
            )}

            <div className="pt-4">
              <Button type="submit" className="w-full" size="lg">
                회원가입
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-500 cursor-pointer">
                로그인하기
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
