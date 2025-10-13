
export const mockUsers = {
  client: {
    id: 1,
    name: "테크혁신",
    email: "client@example.com",
    userType: "client",
    companyName: "테크혁신",
    companySize: "중견기업",
    companyDescription: "IT 솔루션 개발 전문 기업",
    contact: "02-1234-5678",
    representative: "김대표",
    businessNumber: "123-45-67890",
    averageRating: 4.5,
    activityHistory: "프로젝트 20건 진행"
  },
  freelancer: {
    id: 2,
    name: "박개발",
    email: "freelancer@example.com",
    userType: "freelancer",
    experience: "5년",
    skills: ["React", "Node.js", "TypeScript", "Next.js"],
    interests: ["웹 개발", "모바일 앱", "UI/UX"],
    averageRating: 4.8,
    activityHistory: "프로젝트 35건 완료",
    introduction: "풀스택 개발자로 5년간 다양한 프로젝트를 경험했습니다.",
    portfolio: "포트폴리오.pdf",
    resume: "이력서.pdf"
  }
};

export const mockProjects = [
  {
    id: 1,
    title: "E-커머스 웹사이트 개발",
    description: "React와 Node.js를 사용한 온라인 쇼핑몰 개발 프로젝트입니다. 결제 시스템, 상품 관리, 주문 관리 기능이 포함됩니다.",
    skills: ["React", "Node.js", "MongoDB", "Express"],
    duration: "3개월",
    budget: "3000만원",
    status: "모집중",
    category: "웹 개발",
    clientId: 1,
    clientName: "테크혁신",
    createdAt: "2024-01-15",
    deadline: "2024-02-15",
    isEvaluated: false,
    applicants: [
      {
        id: 2,
        name: "박개발",
        email: "dev@example.com",
        contact: "010-1234-5678",
        expectedPrice: "2800만원",
        workPlan: "첫 달에 기본 구조 설계, 둘째 달에 핵심 기능 구현, 셋째 달에 테스트 및 배포",
        expectedDuration: "2.5개월",
        additionalRequests: "반응형 디자인 포함 요청",
        status: "대기중",
        skills: ["React", "Node.js", "TypeScript"]
      },
      {
        id: 5,
        name: "김풀스택",
        email: "kim@example.com",
        contact: "010-2345-6789",
        expectedPrice: "3200만원",
        workPlan: "체계적인 개발 프로세스를 통해 안정적인 서비스 구축",
        expectedDuration: "3개월",
        additionalRequests: "코드 리뷰 및 문서화 포함",
        status: "대기중",
        skills: ["React", "Node.js", "AWS"]
      }
    ]
  },
  {
    id: 2,
    title: "모바일 앱 UI/UX 디자인",
    description: "iOS/Android 앱의 사용자 인터페이스 및 사용자 경험 디자인 프로젝트입니다.",
    skills: ["Figma", "Sketch", "Adobe XD", "Prototyping"],
    duration: "2개월",
    budget: "1500만원",
    status: "진행중",
    category: "디자인",
    clientId: 1,
    clientName: "테크혁신",
    createdAt: "2024-01-10",
    deadline: "2024-02-10",
    isEvaluated: false,
    selectedFreelancer: {
      id: 4,
      name: "이디자인",
      email: "design@example.com"
    },
    applicants: [
      {
        id: 4,
        name: "이디자인",
        email: "design@example.com",
        contact: "010-3456-7890",
        expectedPrice: "1400만원",
        workPlan: "사용자 조사 -> 와이어프레임 -> 프로토타입 -> 최종 디자인",
        expectedDuration: "2개월",
        additionalRequests: "디자인 시스템 구축 포함",
        status: "승인",
        skills: ["Figma", "Adobe XD", "Sketch"]
      }
    ]
  },
  {
    id: 3,
    title: "데이터 분석 대시보드 개발",
    description: "실시간 데이터 시각화 대시보드 개발 프로젝트입니다.",
    skills: ["Python", "Django", "D3.js", "PostgreSQL"],
    duration: "4개월",
    budget: "5000만원",
    status: "완료",
    category: "데이터 분석",
    clientId: 1,
    clientName: "테크혁신",
    createdAt: "2023-10-01",
    deadline: "2023-11-01",
    completedAt: "2024-01-20",
    isEvaluated: true,
    selectedFreelancer: {
      id: 6,
      name: "정데이터",
      email: "data@example.com"
    },
    finalBudget: "4800만원",
    applicants: [
      {
        id: 6,
        name: "정데이터",
        email: "data@example.com",
        contact: "010-4567-8901",
        expectedPrice: "4800만원",
        workPlan: "데이터 수집 -> 분석 -> 시각화 -> 대시보드 구축",
        expectedDuration: "3.5개월",
        additionalRequests: "실시간 업데이트 기능 포함",
        status: "승인",
        skills: ["Python", "Django", "D3.js"]
      }
    ]
  },
  {
    id: 4,
    title: "기업 홈페이지 리뉴얼",
    description: "기존 홈페이지의 전면 리뉴얼 프로젝트입니다.",
    skills: ["React", "Next.js", "Tailwind CSS"],
    duration: "2개월",
    budget: "2000만원",
    status: "완료",
    category: "웹 개발",
    clientId: 1,
    clientName: "테크혁신",
    createdAt: "2023-08-01",
    deadline: "2023-09-01",
    completedAt: "2023-10-15",
    isEvaluated: false,
    selectedFreelancer: {
      id: 2,
      name: "박개발",
      email: "dev@example.com"
    },
    finalBudget: "2000만원",
    applicants: []
  }
];

export const mockFreelancers = [
  {
    id: 2,
    name: "박개발",
    email: "dev@example.com",
    experience: "5년",
    skills: ["React", "Node.js", "TypeScript", "Next.js"],
    interests: ["웹 개발", "모바일 앱"],
    averageRating: 4.8,
    activityHistory: "프로젝트 35건 완료",
    introduction: "풀스택 개발자로 5년간 다양한 프로젝트를 경험했습니다.",
    portfolio: "포트폴리오.pdf",
    ongoingProjects: ["모바일 앱 UI/UX 디자인"],
    completedProjects: ["데이터 분석 대시보드 개발", "기업 홈페이지 리뉴얼", "예약 관리 앱"]
  },
  {
    id: 4,
    name: "이디자인",
    email: "design@example.com",
    experience: "3년",
    skills: ["Figma", "Adobe XD", "Sketch", "Photoshop"],
    interests: ["UI/UX 디자인", "브랜딩"],
    averageRating: 4.6,
    activityHistory: "프로젝트 28건 완료",
    introduction: "사용자 중심의 디자인을 추구하는 UI/UX 디자이너입니다.",
    portfolio: "디자인포트폴리오.pdf",
    ongoingProjects: ["모바일 앱 UI/UX 디자인"],
    completedProjects: ["쇼핑몰 리뉴얼", "기업 웹사이트 디자인"]
  },
  {
    id: 5,
    name: "김풀스택",
    email: "kim@example.com",
    experience: "7년",
    skills: ["React", "Node.js", "AWS", "Docker"],
    interests: ["웹 개발", "클라우드"],
    averageRating: 4.9,
    activityHistory: "프로젝트 42건 완료",
    introduction: "대규모 서비스 개발 경험이 풍부한 시니어 개발자입니다.",
    portfolio: "시니어포트폴리오.pdf",
    ongoingProjects: [],
    completedProjects: ["금융 서비스 플랫폼", "물류 관리 시스템"]
  },
  {
    id: 6,
    name: "정데이터",
    email: "data@example.com",
    experience: "4년",
    skills: ["Python", "Django", "D3.js", "PostgreSQL"],
    interests: ["데이터 분석", "머신러닝"],
    averageRating: 4.7,
    activityHistory: "프로젝트 25건 완료",
    introduction: "데이터 기반 인사이트 도출을 전문으로 하는 개발자입니다.",
    portfolio: "데이터포트폴리오.pdf",
    ongoingProjects: [],
    completedProjects: ["데이터 분석 대시보드 개발", "추천 시스템 구축"]
  }
];

export const mockFeedback = [
  {
    id: 1,
    projectId: 3,
    projectName: "데이터 분석 대시보드 개발",
    authorName: "테크혁신",
    authorType: "client",
    targetName: "정데이터",
    targetType: "freelancer",
    rating: 5,
    feedback: "매우 만족스러운 작업이었습니다. 요구사항을 정확히 이해하고 완벽하게 구현해주셨어요. 커뮤니케이션도 원활했고 일정도 잘 지켜주셨습니다.",
    categories: {
      communication: 5,
      technical: 5,
      schedule: 5,
      paymentCompliance: null // 프리랜서 평가에는 급여 준수 항목 없음
    },
    createdAt: "2024-01-25"
  },
  {
    id: 2,
    projectId: 3,
    projectName: "데이터 분석 대시보드 개발",
    authorName: "정데이터",
    authorType: "freelancer",
    targetName: "테크혁신",
    targetType: "client",
    rating: 4,
    feedback: "전반적으로 좋은 클라이언트였습니다. 요구사항이 명확했고 피드백도 빨랐어요. 다만 중간에 추가 요구사항이 생겨서 약간 일정에 영향이 있었지만, 급여는 약속한 대로 정확히 지급해주셔서 만족합니다.",
    categories: {
      communication: 4,
      technical: 4,
      schedule: 3,
      paymentCompliance: 5 // 클라이언트 평가에는 급여 준수 항목 포함
    },
    createdAt: "2024-01-26"
  },
  {
    id: 3,
    projectId: 4,
    projectName: "기업 홈페이지 리뉴얼",
    authorName: "테크혁신",
    authorType: "client",
    targetName: "박개발",
    targetType: "freelancer",
    rating: 4,
    feedback: "깔끔하고 현대적인 디자인으로 잘 만들어주셨습니다. 반응형도 완벽하고 성능도 좋아요. 다만 초기 커뮤니케이션에서 약간의 오해가 있었지만 잘 해결되었습니다.",
    categories: {
      communication: 3,
      technical: 5,
      schedule: 4,
      paymentCompliance: null
    },
    createdAt: "2023-10-20"
  }
];

// 프리랜서가 지원한 프로젝트들의 상태별 데이터
export const mockFreelancerApplications = [
  {
    id: 1,
    projectId: 1,
    projectTitle: "E-커머스 웹사이트 개발",
    clientName: "테크혁신",
    status: "대기중",
    appliedAt: "2024-01-20",
    budget: "3000만원",
    duration: "3개월",
    expectedPrice: "2800만원"
  },
  {
    id: 2,
    projectId: 2,
    projectTitle: "모바일 앱 UI/UX 디자인",
    clientName: "테크혁신",
    status: "거절",
    appliedAt: "2024-01-15",
    rejectedAt: "2024-01-18",
    budget: "1500만원",
    duration: "2개월",
    expectedPrice: "1400만원",
    rejectionReason: "다른 지원자가 선정되었습니다"
  },
  {
    id: 3,
    projectId: 2,
    projectTitle: "모바일 앱 UI/UX 디자인",
    clientName: "테크혁신",
    status: "진행중",
    appliedAt: "2024-01-10",
    approvedAt: "2024-01-12",
    budget: "1500만원",
    duration: "2개월",
    expectedPrice: "1400만원",
    progress: 60
  },
  {
    id: 4,
    projectId: 3,
    projectTitle: "데이터 분석 대시보드 개발",
    clientName: "테크혁신",
    status: "완료",
    appliedAt: "2023-10-01",
    approvedAt: "2023-10-05",
    completedAt: "2024-01-20",
    budget: "5000만원",
    duration: "4개월",
    expectedPrice: "4800만원",
    finalPayment: "4800만원",
    isEvaluated: true
  },
  {
    id: 5,
    projectId: 4,
    projectTitle: "기업 홈페이지 리뉴얼",
    clientName: "테크혁신",
    status: "완료",
    appliedAt: "2023-08-01",
    approvedAt: "2023-08-03",
    completedAt: "2023-10-15",
    budget: "2000만원",
    duration: "2개월",
    expectedPrice: "2000만원",
    finalPayment: "2000만원",
    isEvaluated: false
  }
];

export const mockRecommendations = {
  forClient: [
    {
      freelancerId: 2,
      name: "박개발",
      skills: ["React", "Node.js", "TypeScript"],
      matchRate: 95,
      pastProjects: 35,
      rating: 4.8,
      reason: "기술 스택 매칭률이 높고 유사한 프로젝트 경험이 풍부합니다."
    },
    {
      freelancerId: 4,
      name: "이디자인",
      skills: ["Figma", "Adobe XD", "UI/UX"],
      matchRate: 87,
      pastProjects: 28,
      rating: 4.6,
      reason: "디자인 분야 전문성과 높은 평점을 보유하고 있습니다."
    }
  ],
  forFreelancer: [
    {
      projectId: 1,
      title: "E-커머스 웹사이트 개발",
      budget: "3000만원",
      matchRate: 92,
      client: "테크혁신",
      reason: "보유 기술 스택과 정확히 일치하며 예산이 적정합니다."
    },
    {
      projectId: 3,
      title: "데이터 분석 대시보드 개발",
      budget: "5000만원",
      matchRate: 78,
      client: "테크혁신",
      reason: "풀스택 개발 경험을 활용할 수 있는 프로젝트입니다."
    }
  ]
};
