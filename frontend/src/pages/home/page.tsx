import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/base/Button";
import { useApiClient } from "../../lib/backend/apiClient";
import { mockFreelancers } from "../../mocks/users";

export default function Home() {
  const client = useApiClient();
  const [latestProjects, setLatestProjects] = useState<any[]>([]);
  const featuredFreelancers = mockFreelancers.slice(0, 2);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const { data, error } = await client.GET(
          "/api/v1/projects?page=0&size=3&sort=createDate,DESC"
        );
        if (error) throw error;
        setLatestProjects(data?.data?.content ?? []);
      } catch (err) {
        console.error("최신 프로젝트 불러오기 실패:", err);
      }
    };
    fetchFeaturedProjects();
  }, []);

  return (
    <div className="min-h-screen">
      {/* 히어로 섹션 */}
      <section
        className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-24"
        style={{
          backgroundImage: `url('https://readdy.ai/api/search-image?query=Modern%20freelancer%20working%20on%20laptop%20in%20bright%20office%20space%2C%20professional%20collaboration%2C%20diverse%20team%2C%20clean%20minimalist%20workspace%2C%20natural%20lighting%2C%20productivity%20and%20innovation%20concept%2C%20business%20teamwork%20background&width=1920&height=700&seq=hero2&orientation=landscape')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              Find your perfect work buddy
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-blue-100 leading-relaxed">
              WorkBuddy는 프리랜서와 클라이언트를 연결하는 매칭 플랫폼입니다.
              <br />
              프리랜서는 자신에게 딱 맞는 프로젝트를 찾아 지원하고,
              <br />
              클라이언트는 신뢰할 수 있는 프리랜서를 발견하여 제안할 수
              있습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/projects">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all border-0"
                >
                  <i className="ri-search-line mr-2"></i>
                  프로젝트 찾기
                </Button>
              </Link>

              <Link to="/freelancers">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all border-0"
                >
                  <i className="ri-team-line mr-2"></i>
                  프리랜서 찾기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 공지사항/배너 */}
      <section className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center bg-white rounded-full px-6 py-3 shadow-sm">
              <i className="ri-notification-3-line text-yellow-600 mr-3 text-lg"></i>
              <span className="text-sm font-medium text-gray-800">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                  새로운 기능 출시!&nbsp;
                </span>
                AI 기반 맞춤 추천 서비스가 시작되었습니다.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 서비스 소개 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              왜 우리 플랫폼을 선택해야 할까요?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              검증된 매칭 시스템과 안전한 거래 환경을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-shield-check-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                안전한 거래
              </h3>
              <p className="text-gray-600">
                에스크로 시스템과 평가 시스템으로 안전하고 신뢰할 수 있는 거래를
                보장합니다
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-ai-generate text-2xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                AI 매칭
              </h3>
              <p className="text-gray-600">
                고도화된 AI 알고리즘으로 프로젝트와 프리랜서를 정확하게
                매칭합니다
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-customer-service-2-line text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                24/7 지원
              </h3>
              <p className="text-gray-600">
                전문 상담사가 24시간 프로젝트 진행을 도와드립니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 추천 프로젝트 섹션 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              최신 프로젝트
            </h2>
            <p className="text-lg text-gray-600">
              지금 가장 최근 등록된 프로젝트들을 확인해보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.status === "OPEN"
                        ? "bg-green-100 text-green-800"
                        : project.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {project.status === "OPEN"
                      ? "모집중"
                      : project.status === "IN_PROGRESS"
                      ? "진행중"
                      : "완료"}
                  </span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {project.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {project.summary || project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.skills?.slice(0, 3).map((skill: any) => (
                    <span
                      key={skill.id || skill}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                    >
                      {skill.name || skill}
                    </span>
                  ))}
                  {project.skills?.length > 3 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{project.skills.length - 3}개
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
                  <div className="flex items-center">
                    <i className="ri-money-dollar-circle-line mr-1"></i>
                    <span className="font-semibold text-green-600">
                      {project.price?.toLocaleString() || 0}원
                    </span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-time-line mr-1"></i>
                    <span>{project.duration}</span>
                  </div>
                </div>

                <Link to={`/projects/${project.id}`}>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all"
                  >
                    <i className="ri-arrow-right-line mr-2"></i>
                    자세히 보기
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/projects">
              <Button size="lg" className="px-8 py-4 text-lg">
                <i className="ri-folder-open-line mr-2"></i>
                모든 프로젝트 보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 추천 프리랜서 섹션 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              추천 프리랜서
            </h2>
            <p className="text-lg text-gray-600">
              다양한 분야의 전문가들을 만나보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredFreelancers.map((freelancer) => (
              <div
                key={freelancer.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
              >
                <img
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                  src={freelancer.avatar}
                  alt={freelancer.name}
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  {freelancer.name}
                </h3>
                <p className="text-gray-600 text-sm text-center mb-4 line-clamp-2">
                  {freelancer.bio}
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {freelancer.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
