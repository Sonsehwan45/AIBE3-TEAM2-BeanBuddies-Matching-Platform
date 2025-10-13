import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockFreelancers, mockProjects } from '../../../../mocks/users';
import Button from '../../../../components/base/Button';
import Select from '../../../../components/base/Select';

export default function FreelancerPropose() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    projectId: '',
    message: ''
  });

  const freelancer = mockFreelancers.find(f => f.id === Number(id));
  const myProjects = mockProjects.filter(p => p.clientId === 1); // 현재 클라이언트의 프로젝트

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('프로젝트 제안:', formData);
    alert('프로젝트 제안이 성공적으로 전송되었습니다!');
  };

  if (!freelancer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">프리랜서를 찾을 수 없습니다</h2>
          <Link to="/freelancers">
            <Button>프리랜서 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const projectOptions = myProjects.map(project => ({
    value: project.id.toString(),
    label: `${project.title} (${project.budget})`
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 뒤로가기 */}
        <div className="mb-6">
          <Link to={`/freelancers/${freelancer.id}`} className="flex items-center text-blue-600 hover:text-blue-700 cursor-pointer">
            <i className="ri-arrow-left-line mr-2"></i>
            프리랜서 프로필로 돌아가기
          </Link>
        </div>

        {/* 프리랜서 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {freelancer.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{freelancer.name}</h2>
              <p className="text-gray-600">{freelancer.email}</p>
              <div className="flex items-center mt-1">
                <i className="ri-star-fill text-yellow-400 mr-1"></i>
                <span className="text-sm font-medium">{freelancer.averageRating}</span>
                <span className="text-sm text-gray-500 ml-2">경력: {freelancer.experience}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 제안서 작성 폼 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">프로젝트 제안하기</h1>
            <p className="text-gray-600">프리랜서에게 프로젝트를 제안해보세요.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Select
              label="제안할 프로젝트"
              options={[
                { value: '', label: '프로젝트를 선택하세요' },
                ...projectOptions
              ]}
              value={formData.projectId}
              onChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제안 메시지 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="프리랜서에게 전달할 메시지를 작성해주세요. 프로젝트에 대한 상세한 설명과 기대사항을 포함해주세요."
                required
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="mt-1 text-sm text-gray-500">최소 50자 이상 작성해주세요.</p>
            </div>

            {/* 선택된 프로젝트 정보 */}
            {formData.projectId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">선택된 프로젝트</h3>
                {(() => {
                  const selectedProject = myProjects.find(p => p.id.toString() === formData.projectId);
                  return selectedProject ? (
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">{selectedProject.title}</p>
                      <p className="mt-1">{selectedProject.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span>예산: {selectedProject.budget}</span>
                        <span>기간: {selectedProject.duration}</span>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {/* 제출 버튼 */}
            <div className="flex space-x-4 pt-6">
              <Link to={`/freelancers/${freelancer.id}`} className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  취소
                </Button>
              </Link>
              <Button type="submit" className="flex-1" size="lg">
                제안 전송
              </Button>
            </div>
          </form>
        </div>

        {/* 안내사항 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex">
            <i className="ri-information-line text-blue-500 text-lg mr-3 mt-0.5"></i>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">프로젝트 제안 안내</p>
              <ul className="space-y-1 text-blue-700">
                <li>• 제안 전송 후 프리랜서가 검토하게 됩니다.</li>
                <li>• 프리랜서의 수락/거절 여부를 알림으로 받아보실 수 있습니다.</li>
                <li>• 성의 있고 구체적인 제안서가 수락률을 높입니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}