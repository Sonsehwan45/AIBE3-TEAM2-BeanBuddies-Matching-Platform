"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../../../../global/backend/client";

interface Skill {
  id: number;
  name: string;
}

interface Interest {
  id: number;
  name: string;
}

export default function ProjectsEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    duration: "",
    price: "",
    preferredCondition: "",
    payCondition: "",
    workingCondition: "",
    description: "",
    deadline: "",
    skills: [] as number[],
    interests: [] as number[],
  });

  const [skills, setSkills] = useState<Skill[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);

  // 프로젝트 데이터 불러오기
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await client.GET(`/api/v1/projects/${id}`);
        if (response.error) throw response.error;

        const projectData = response.data;
        
        // ISO 날짜 문자열을 input[type="datetime-local"]에 맞는 형식으로 변환
        const deadline = new Date(projectData.deadline)
          .toISOString()
          .slice(0, 16); // "YYYY-MM-DDTHH:mm" 형식으로 자르기

        setFormData({
          title: projectData.title,
          summary: projectData.summary,
          duration: projectData.duration,
          price: projectData.price.toString(),
          preferredCondition: projectData.preferredCondition,
          payCondition: projectData.payCondition,
          workingCondition: projectData.workingCondition,
          description: projectData.description,
          deadline: deadline,
          skills: projectData.skills.map((s: Skill) => s.id),
          interests: projectData.interests.map((i: Interest) => i.id),
        });
      } catch (err) {
        console.error("프로젝트 데이터 로드 실패:", err);
        setError("프로젝트 정보를 불러오는데 실패했습니다.");
      }
    };

    // skills, interests 목록 불러오기
    Promise.all([
      client.GET("/api/v1/skills"),
      client.GET("/api/v1/interests"),
      fetchProject()
    ]).then(([skillsRes, interestsRes]) => {
      setSkills(skillsRes.data?.data ?? []);
      setInterests(interestsRes.data?.data ?? []);
      setLoading(false);
    }).catch(err => {
      console.error("데이터 로드 실패:", err);
      setError("필요한 데이터를 불러오는데 실패했습니다.");
      setLoading(false);
    });
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, selectedOptions } = e.target;
    const selectedIds = Array.from(selectedOptions).map((opt) =>
      Number(opt.value)
    );
    setFormData((prev) => ({ ...prev, [name]: selectedIds }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;

    // ...existing validation logic...

    // 서버로 보낼 데이터 구성
    const body = {
      title: formData.title,
      summary: formData.summary,
      duration: formData.duration,
      price: Number(formData.price),
      preferredCondition: formData.preferredCondition,
      payCondition: formData.payCondition,
      workingCondition: formData.workingCondition,
      description: formData.description,
      deadline: formData.deadline,
      skills: formData.skills,
      interests: formData.interests,
    };

    try {
      // PATCH 요청으로 변경
      const response = await client.PATCH(`/api/v1/projects/${id}`, { body });
      
      if (response.error) {
        alert(response.error.msg);
        return;
      }

      alert("프로젝트가 성공적으로 수정되었습니다.");
      navigate(`/projects/${id}`);
    } catch (err) {
      console.error("프로젝트 수정 실패:", err);
      alert("프로젝트 수정에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">프로젝트 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
          <button
            onClick={() => navigate('/projects')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            프로젝트 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // Return the same form JSX as create page, but with "수정하기" button text
  return (
    // ...existing form JSX with modified header and button text...
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 수정 */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <i className="ri-edit-2-line text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">프로젝트 수정</h1>
              <p className="text-gray-600">프로젝트 정보를 수정하세요</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 space-y-8"
        >
          {/* 기본 정보 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-indigo-500 pl-2">
              기본 정보
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  제목
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="프로젝트 제목을 입력하세요"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  기간
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="예: 3개월"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  요약
                </label>
                <input
                  type="text"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  placeholder="간단한 프로젝트 요약을 입력하세요"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  가격 (₩)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0 이상 입력"
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* 조건 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-indigo-500 pl-2">
              프로젝트 조건
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  우대 조건
                </label>
                <input
                  type="text"
                  name="preferredCondition"
                  value={formData.preferredCondition}
                  onChange={handleChange}
                  placeholder="예: React 숙련자"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  급여 조건
                </label>
                <input
                  type="text"
                  name="payCondition"
                  value={formData.payCondition}
                  onChange={handleChange}
                  placeholder="예: 월 300만원"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  업무 조건
                </label>
                <input
                  type="text"
                  name="workingCondition"
                  value={formData.workingCondition}
                  onChange={handleChange}
                  placeholder="예: 주 5일 / 원격 가능"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* 상세 설명 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-indigo-500 pl-2">
              상세 설명
            </h2>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="프로젝트에 대한 상세 내용을 입력하세요"
              rows={6}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              required
            ></textarea>
          </div>

          {/* 마감일 / 기술 / 관심분야 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                마감일
              </label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                필요 기술
              </label>
              <select
                name="skills"
                multiple
                value={formData.skills}
                onChange={handleSelectChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none h-32"
              >
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Ctrl/⌘ 키로 여러 개 선택
              </p>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                관심 분야
              </label>
              <select
                name="interests"
                multiple
                value={formData.interests}
                onChange={handleSelectChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none h-32"
              >
                {interests.map((interest) => (
                  <option key={interest.id} value={interest.id}>
                    {interest.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Ctrl/⌘ 키로 여러 개 선택
              </p>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition"
            >
              수정하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}