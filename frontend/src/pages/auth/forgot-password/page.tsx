
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/base/Button';
import Input from '../../../components/base/Input';

export default function ForgotPassword() {
  const [step, setStep] = useState<'info' | 'verification' | 'reset'>('info');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('계정 정보 확인:', { username: formData.username, email: formData.email });
    alert('인증 코드가 이메일로 전송되었습니다.');
    setStep('verification');
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('인증 코드 확인:', formData.verificationCode);
    alert('인증이 완료되었습니다.');
    setStep('reset');
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    console.log('비밀번호 재설정:', formData.newPassword);
    alert('비밀번호가 성공적으로 변경되었습니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">비밀번호 찾기</h2>
          <p className="mt-2 text-gray-600">
            {step === 'info' && '아이디와 이메일을 입력해주세요'}
            {step === 'verification' && '인증 코드를 입력해주세요'}
            {step === 'reset' && '새 비밀번호를 설정해주세요'}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {/* 단계 표시 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {['계정 정보 입력', '인증 확인', '비밀번호 재설정'].map((label, index) => (
                <div key={label} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    (step === 'info' && index === 0) ||
                    (step === 'verification' && index === 1) ||
                    (step === 'reset' && index === 2)
                      ? 'bg-blue-600 text-white'
                      : index < (step === 'info' ? 0 : step === 'verification' ? 1 : 2)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index < (step === 'info' ? 0 : step === 'verification' ? 1 : 2) ? 
                      <i className="ri-check-line"></i> : index + 1
                    }
                  </div>
                  {index < 2 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      index < (step === 'info' ? 0 : step === 'verification' ? 1 : 2)
                        ? 'bg-green-600'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>계정 정보</span>
              <span>인증 확인</span>
              <span>비밀번호 재설정</span>
            </div>
          </div>

          {/* 계정 정보 입력 단계 */}
          {step === 'info' && (
            <form onSubmit={handleInfoSubmit} className="space-y-6">
              <Input
                label="아이디"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="등록된 아이디를 입력하세요"
                required
              />

              <Input
                label="이메일"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="등록된 이메일 주소를 입력하세요"
                required
              />
              
              <Button type="submit" className="w-full" size="lg">
                인증 코드 전송
              </Button>
            </form>
          )}

          {/* 인증 코드 확인 단계 */}
          {step === 'verification' && (
            <form onSubmit={handleVerificationSubmit} className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>{formData.email}</strong>로 인증 코드를 전송했습니다.
                </p>
                <Input
                  label="인증 코드"
                  value={formData.verificationCode}
                  onChange={(e) => handleInputChange('verificationCode', e.target.value)}
                  placeholder="6자리 인증 코드를 입력하세요"
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={() => setStep('info')} className="flex-1">
                  이전
                </Button>
                <Button type="submit" className="flex-1">
                  인증 확인
                </Button>
              </div>
              
              <div className="text-center">
                <button type="button" className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer">
                  인증 코드 재전송
                </button>
              </div>
            </form>
          )}

          {/* 비밀번호 재설정 단계 */}
          {step === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-6">
              <Input
                label="새 비밀번호"
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="8자 이상의 새 비밀번호"
                required
              />
              
              <Input
                label="비밀번호 확인"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="새 비밀번호를 다시 입력하세요"
                required
              />
              
              <Button type="submit" className="w-full" size="lg">
                비밀번호 재설정
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer">
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
