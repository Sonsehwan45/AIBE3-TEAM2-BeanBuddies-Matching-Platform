"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApiClient } from "@/lib/backend/apiClient";

interface Skill {
  id: number;
  name: string;
}

interface Interest {
  id: number;
  name: string;
}

export default function ProjectsCreatePage() {
  const client = useApiClient();
  const { user, token, isLoggedIn } = useAuth();
  const navigate = useNavigate();
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

  // ✅ 로그인 및 권한 확인
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    if (user?.role !== "CLIENT") {
      alert("프로젝트 등록은 클라이언트만 가능합니다.");
      navigate("/");
      return;
    }
  }, [isLoggedIn, user, navigate]);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);

  // skills, interests 불러오기
  useEffect(() => {
    // client 인스턴스 사용
    client
      .GET("/api/v1/skills")
      .then(({ data }) => {
        setSkills(data?.data ?? []);
      })
      .catch((err) => console.error("skills fetch error:", err));

    client
      .GET("/api/v1/interests")
      .then(({ data }) => {
        setInterests(data?.data ?? []);
      })
      .catch((err) => console.error("interests fetch error:", err));
  }, []);

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;

    const titleInput = form.elements.namedItem("title") as HTMLInputElement;
    const summaryInput = form.elements.namedItem(
      "summary"
    ) as HTMLTextAreaElement;
    const durationInput = form.elements.namedItem(
      "duration"
    ) as HTMLInputElement;
    const priceInput = form.elements.namedItem("price") as HTMLInputElement;
    const preferredInput = form.elements.namedItem(
      "preferredCondition"
    ) as HTMLInputElement;
    const payInput = form.elements.namedItem(
      "payCondition"
    ) as HTMLInputElement;
    const workingInput = form.elements.namedItem(
      "workingCondition"
    ) as HTMLInputElement;
    const descriptionInput = form.elements.namedItem(
      "description"
    ) as HTMLTextAreaElement;
    const deadlineInput = form.elements.namedItem(
      "deadline"
    ) as HTMLInputElement;

    // 필수 입력값 검증
    if (titleInput.value.trim() === "") {
      alert("제목을 입력해주세요.");
      titleInput.focus();
      return;
    }
    if (summaryInput.value.trim() === "") {
      alert("요약을 입력해주세요.");
      summaryInput.focus();
      return;
    }
    if (durationInput.value.trim() === "") {
      alert("기간을 입력해주세요.");
      durationInput.focus();
      return;
    }
    if (priceInput.value.trim() === "" || Number(priceInput.value) <= 0) {
      alert("유효한 가격을 입력해주세요.");
      priceInput.focus();
      return;
    }
    if (preferredInput.value.trim() === "") {
      alert("우대 조건을 입력해주세요.");
      preferredInput.focus();
      return;
    }
    if (payInput.value.trim() === "") {
      alert("급여 조건을 입력해주세요.");
      payInput.focus();
      return;
    }
    if (workingInput.value.trim() === "") {
      alert("업무 조건을 입력해주세요.");
      workingInput.focus();
      return;
    }
    if (descriptionInput.value.trim() === "") {
      alert("상세 설명을 입력해주세요.");
      descriptionInput.focus();
      return;
    }
    if (deadlineInput.value.trim() === "") {
      alert("마감일을 입력해주세요.");
      deadlineInput.focus();
      return;
    }

    // 선택된 skill / interest id 모으기
    const selectedSkills = Array.from(
      form.querySelectorAll("input[name='skills']:checked")
    ).map((el) => Number((el as HTMLInputElement).value));
    const selectedInterests = Array.from(
      form.querySelectorAll("input[name='interests']:checked")
    ).map((el) => Number((el as HTMLInputElement).value));

    // 서버로 보낼 데이터 구성
    const body = {
      title: titleInput.value,
      summary: summaryInput.value,
      duration: durationInput.value,
      price: Number(priceInput.value),
      preferredCondition: preferredInput.value,
      payCondition: payInput.value,
      workingCondition: workingInput.value,
      description: descriptionInput.value,
      deadline: deadlineInput.value,
      skills: selectedSkills,
      interests: selectedInterests,
    };

    // 요청
    client
      .POST("/api/v1/projects", {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ 토큰 포함
        },
        body,
      })
      .then((res: any) => {
        if (res.error) {
          alert(res.error.msg);
          return;
        }

        alert(res.data.msg);
        navigate(`/projects/${res.data.data.id}`);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <i className="ri-file-edit-line text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                프로젝트 등록
              </h1>
              <p className="text-gray-600">원하는 프로젝트를 등록하세요</p>
            </div>
          </div>
        </div>

        {/* 등록창 */}
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
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
