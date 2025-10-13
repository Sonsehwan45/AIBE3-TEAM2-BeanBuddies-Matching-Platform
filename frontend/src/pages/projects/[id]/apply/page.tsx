import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockProjects } from '../../../../mocks/users';
import Button from '../../../../components/base/Button';
import Input from '../../../../components/base/Input';

export default function ProjectApply() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    expectedPrice: '',
    workPlan: '',
    expectedDuration: '',
    additionalRequests: ''
  });

  const project = mockProjects.find(p => p.id === Number(id));

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('지원서 제출:', formData);
    alert('지원서가 성공적으로 제출되었습니다!');
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">프로젝트를 찾을 수 없습니다</h2>
          <Link to="/projects">
            <Button>프로젝트 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 뒤로가기 */}
        <div className="mb-6">
          <Link to={`/projects/${project.id}`} className="flex items-center text-blue-600 hover:text-blue-700 cursor-pointer">
            <i className="ri-arrow-left-line mr-2"></i>
            프로젝트 상세로 돌아가기
          </Link>
        </div>

        {/* 프로젝트 요약 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>예산: {project.budget}</span>
            <span>기간: {project.duration}</span>
            <span>클라이언트: {project.clientName}</span>
          </div>
        </div>

        {/* 지원서 작성 폼 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">지원서 작성</h1>
            <p className="text-gray-600">프로젝트에 대한 상세한 제안을 작성해주세요.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="예상 견적"
              value={formData.expectedPrice}
              onChange={(e) => handleInputChange('expectedPrice', e.target.value)}
              placeholder="예: 2,500만원"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                작업 계획 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.workPlan}
                onChange={(e) => handleInputChange('workPlan', e.target.value)}
                placeholder="프로젝트를 어떻게 진행할 계획인지 상세히 작성해주세요."
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <Input
              label="예상 작업 기간"
              value={formData.expectedDuration}
              onChange={(e) => handleInputChange('expectedDuration', e.target.value)}
              placeholder="예: 2.5개월"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추가 요청사항
              </label>
              <textarea
                value={formData.additionalRequests}
                onChange={(e) => handleInputChange('additionalRequests', e.target.value)}
                placeholder="프로젝트 진행 시 필요한 추가 요청사항이나 문의사항을 작성해주세요."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* 첨부 파일 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">첨부 파일</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <i className="ri-file-text-line text-3xl text-gray-400 mb-2"></i>
                  <p className="text-sm text-gray-600 mb-2">이력서 첨부</p>
                  <Button variant="outline" size="sm">파일 선택</Button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <i className="ri-folder-line text-3xl text-gray-400 mb-2"></i>
                  <p className="text-sm text-gray-600 mb-2">포트폴리오 첨부</p>
                  <Button variant="outline" size="sm">파일 선택</Button>
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex space-x-4 pt-6">
              <Link to={`/projects/${project.id}`} className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  취소
                </Button>
              </Link>
              <Button type="submit" className="flex-1" size="lg">
                지원서 제출
              </Button>
            </div>
          </form>
        </div>

        {/* 안내사항 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex">
            <i className="ri-information-line text-blue-500 text-lg mr-3 mt-0.5"></i>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">지원서 제출 전 확인사항</p>
              <ul className="space-y-1 text-blue-700">
                <li>• 제출한 지원서는 수정이 불가능합니다.</li>
                <li>• 클라이언트의 검토 후 연락을 받게 됩니다.</li>
                <li>• 허위 정보 기재 시 계정이 제재될 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}