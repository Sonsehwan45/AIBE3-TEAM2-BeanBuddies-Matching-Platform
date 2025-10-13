import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/base/Button';
import Input from '../../../components/base/Input';

export default function DeleteAccount() {
  const [step, setStep] = useState<'info' | 'verification'>('info');
  const [verificationMethod, setVerificationMethod] = useState<'password' | 'otp'>('password');
  const [formData, setFormData] = useState({
    password: '',
    otpCode: '',
    reason: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    setStep('verification');
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('계정 탈퇴 인증:', formData);
    const confirmed = confirm('정말로 계정을 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (confirmed) {
      alert('계정이 성공적으로 탈퇴되었습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <i className="ri-error-warning-line text-4xl text-red-500 mb-4"></i>
          <h2 className="text-3xl font-bold text-gray-900">계정 탈퇴</h2>
          <p className="mt-2 text-gray-600">계정 탈퇴 전 안내사항을 확인해주세요</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {step === 'info' && (
            <div className="space-y-6">
              {/* 탈퇴 안내 */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-3">
                  <i className="ri-alert-line mr-2"></i>
                  계정 탈퇴 안내
                </h3>
                <ul className="text-sm text-red-700 space-y-2">
                  <li>• 탈퇴 시 모든 개인정보와 활동 내역이 삭제됩니다</li>
                  <li>• 진행 중인 프로젝트가 있다면 완료 후 탈퇴해주세요</li>
                  <li>• 탈퇴 후 동일한 이메일로 재가입이 제한될 수 있습니다</li>
                  <li>• 탈퇴 처리는 즉시 완료되며 복구가 불가능합니다</li>
                </ul>
              </div>

              {/* 탈퇴 사유 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  탈퇴 사유 (선택사항)
                </label>
                <div className="space-y-2">
                  {[
                    '서비스 이용 빈도가 낮음',
                    '원하는 프로젝트/프리랜서를 찾기 어려움',
                    '다른 플랫폼 이용',
                    '개인정보 보호',
                    '기타'
                  ].map((reason) => (
                    <label key={reason} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="reason"
                        value={reason}
                        onChange={(e) => handleInputChange('reason', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <Link to="/mypage" className="flex-1">
                  <Button variant="outline" className="w-full">취소</Button>
                </Link>
                <Button onClick={handleContinue} variant="danger" className="flex-1">
                  계속하기
                </Button>
              </div>
            </div>
          )}

          {step === 'verification' && (
            <div className="space-y-6">
              {/* 본인 인증 방법 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  본인 인증 방법 선택
                </label>
                <div className="space-x-4 flex">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="password"
                      checked={verificationMethod === 'password'}
                      onChange={(e) => setVerificationMethod(e.target.value as 'password' | 'otp')}
                      className="sr-only"
                    />
                    <div className={`px-4 py-2 border rounded-lg transition-colors ${
                      verificationMethod === 'password' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}>
                      <i className="ri-lock-line mr-2"></i>
                      비밀번호
                    </div>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="otp"
                      checked={verificationMethod === 'otp'}
                      onChange={(e) => setVerificationMethod(e.target.value as 'password' | 'otp')}
                      className="sr-only"
                    />
                    <div className={`px-4 py-2 border rounded-lg transition-colors ${
                      verificationMethod === 'otp' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}>
                      <i className="ri-smartphone-line mr-2"></i>
                      OTP
                    </div>
                  </label>
                </div>
              </div>

              <form onSubmit={handleVerificationSubmit} className="space-y-6">
                {verificationMethod === 'password' ? (
                  <Input
                    label="비밀번호"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="현재 비밀번호를 입력하세요"
                    required
                  />
                ) : (
                  <div>
                    <Input
                      label="OTP 코드"
                      value={formData.otpCode}
                      onChange={(e) => handleInputChange('otpCode', e.target.value)}
                      placeholder="6자리 OTP 코드를 입력하세요"
                      required
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      휴대폰으로 전송된 인증 코드를 입력해주세요
                    </p>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <i className="ri-warning-line mr-2"></i>
                    <strong>최종 확인:</strong> 인증 확인 후 계정이 즉시 삭제되며 복구가 불가능합니다.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button type="button" variant="outline" onClick={() => setStep('info')} className="flex-1">
                    이전
                  </Button>
                  <Button type="submit" variant="danger" className="flex-1">
                    계정 탈퇴
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/mypage" className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer">
              마이페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}