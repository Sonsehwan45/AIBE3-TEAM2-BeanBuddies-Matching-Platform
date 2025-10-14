/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ApiResponseVoid {
  resultCode: string;
  msg: string;
  data: any;
}

export interface FreelancerUpdateForm {
  job?: string;
  freelancerEmail?: string;
  comment?: string;
  career?: Record<string, number>;
  skillIds?: number[];
}

export interface ApiResponseFreelancerUpdateResponse {
  resultCode: string;
  msg: string;
  data: FreelancerUpdateResponse;
}

export interface FreelancerUpdateResponse {
  /** @format int64 */
  id?: number;
  job?: string;
  freelancerEmail?: string;
  comment?: string;
  career?: Record<string, number>;
}

export interface ClientUpdateForm {
  companySize?: string;
  companyDescription?: string;
  representative?: string;
  businessNo?: string;
  companyPhone?: string;
  companyEmail?: string;
}

export interface ApiResponseClientUpdateResponse {
  resultCode: string;
  msg: string;
  data: ClientUpdateResponse;
}

export interface ClientUpdateResponse {
  /** @format int64 */
  id?: number;
  companySize?: string;
  companyDescription?: string;
  representative?: string;
  businessNo?: string;
  companyPhone?: string;
  companyEmail?: string;
}

export interface ProjectWriteReqBody {
  /** @minLength 1 */
  title: string;
  /** @minLength 1 */
  summary: string;
  /** @minLength 1 */
  duration: string;
  /** @min 0 */
  price: number;
  /** @minLength 1 */
  preferredCondition: string;
  /** @minLength 1 */
  payCondition: string;
  /** @minLength 1 */
  workingCondition: string;
  /** @minLength 1 */
  description: string;
  /** @format date-time */
  deadline: string;
  skills?: number[];
  interests?: number[];
}

export interface ApiResponseProjectDto {
  resultCode: string;
  msg: string;
  data: ProjectDto;
}

export interface InterestDto {
  /** @format int64 */
  id?: number;
  name?: string;
}

export interface ProjectDto {
  /** @format int64 */
  id?: number;
  title?: string;
  summary?: string;
  duration?: string;
  price?: number;
  preferredCondition?: string;
  payCondition?: string;
  workingCondition?: string;
  description?: string;
  /** @format date-time */
  deadline?: string;
  status?: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";
  /** @format date-time */
  createDate?: string;
  /** @format date-time */
  modifyDate?: string;
  ownerName?: string;
  skills?: SkillDto[];
  interests?: InterestDto[];
}

export interface SkillDto {
  /** @format int64 */
  id?: number;
  name?: string;
}

export interface ProposalWriteReqBody {
  /** @format int64 */
  freelancerId: number;
  /** @minLength 1 */
  message: string;
}

export interface ApiResponseProposalDto {
  resultCode: string;
  msg: string;
  data: ProposalDto;
}

export interface ProposalDto {
  /** @format int64 */
  id?: number;
  message?: string;
  /** @format int64 */
  projectId?: number;
  /** @format int64 */
  freelancerId?: number;
  freelancerName?: string;
  /** @format int64 */
  clientId?: number;
  clientName?: string;
  status?: "WAIT" | "ACCEPT" | "DENIED";
}

export interface ApplicationWriteReqBody {
  /** @min 0 */
  estimatedPay: number;
  /** @minLength 1 */
  expectedDuration: string;
  /** @minLength 1 */
  workPlan: string;
  /** @minLength 1 */
  additionalRequest: string;
}

export interface ApiResponseApplicationDto {
  resultCode: string;
  msg: string;
  data: ApplicationDto;
}

export interface ApplicationDto {
  /** @format int64 */
  id?: number;
  estimatedPay?: number;
  expectedDuration?: string;
  workPlan?: string;
  additionalRequest?: string;
  status?: "WAIT" | "ACCEPT" | "DENIED";
  freelancerName?: string;
  /** @format int64 */
  freelancerId?: number;
  projectTitle?: string;
  /** @format int64 */
  projectId?: number;
  clientName?: string;
  /** @format int64 */
  clientId?: number;
  /** @format date-time */
  createDate?: string;
  /** @format date-time */
  modifyDate?: string;
}

export interface MemberJoinReq {
  /** @minLength 1 */
  role: string;
  /**
   * @minLength 2
   * @maxLength 20
   */
  name: string;
  /**
   * @minLength 2
   * @maxLength 20
   */
  username: string;
  /**
   * @minLength 4
   * @maxLength 20
   */
  password: string;
  /**
   * @minLength 4
   * @maxLength 20
   */
  passwordConfirm: string;
  /** @minLength 1 */
  email: string;
}

export interface ApiResponseMemberDto {
  resultCode: string;
  msg: string;
  data: MemberDto;
}

export interface MemberDto {
  /** @format int64 */
  id?: number;
  name?: string;
  role?: string;
  status?: string;
}

export interface PasswordResetVerifyReq {
  /** @minLength 1 */
  username: string;
  /** @minLength 1 */
  email: string;
  /** @minLength 1 */
  code: string;
}

export interface PasswordResetEmailReq {
  /** @minLength 1 */
  username: string;
  /** @minLength 1 */
  email: string;
}

export interface JoinVerifyReq {
  /** @minLength 1 */
  email: string;
  /** @minLength 1 */
  code: string;
}

export interface JoinEmailReq {
  /** @minLength 1 */
  email: string;
}

export interface EvaluationCreateReq {
  /** @format int64 */
  projectId?: number;
  /** @format int64 */
  evaluateeId?: number;
  ratings: Ratings;
  comment?: string;
}

export interface Ratings {
  /**
   * @format int32
   * @min 1
   * @max 5
   */
  professionalism?: number;
  /**
   * @format int32
   * @min 1
   * @max 5
   */
  scheduleAdherence?: number;
  /**
   * @format int32
   * @min 1
   * @max 5
   */
  communication?: number;
  /**
   * @format int32
   * @min 1
   * @max 5
   */
  proactiveness?: number;
}

export interface ApiResponseEvaluationResponse {
  resultCode: string;
  msg: string;
  data: EvaluationResponse;
}

export interface EvaluationResponse {
  /** @format int64 */
  evaluationId?: number;
  /** @format int64 */
  projectId?: number;
  /** @format int64 */
  evaluatorId?: number;
  /** @format int64 */
  evaluateeId?: number;
  comment?: string;
  /** @format int32 */
  ratingSatisfaction?: number;
  /** @format int32 */
  ratingProfessionalism?: number;
  /** @format int32 */
  ratingScheduleAdherence?: number;
  /** @format int32 */
  ratingCommunication?: number;
  /** @format int32 */
  ratingProactiveness?: number;
  /** @format date-time */
  createdAt?: string;
}

export interface MemberLoginReq {
  /**
   * @minLength 2
   * @maxLength 20
   */
  username: string;
  /**
   * @minLength 4
   * @maxLength 20
   */
  password: string;
}

export interface ProposalStateUpdateReqBody {
  status: string;
}

export interface ApplicationModifyReqBody {
  status: "WAIT" | "ACCEPT" | "DENIED";
}

export interface ProjectModifyReqBody {
  /** @minLength 1 */
  title: string;
  /** @minLength 1 */
  summary: string;
  /** @minLength 1 */
  duration: string;
  /** @min 0 */
  price: number;
  /** @minLength 1 */
  preferredCondition: string;
  /** @minLength 1 */
  payCondition: string;
  /** @minLength 1 */
  workingCondition: string;
  /** @minLength 1 */
  description: string;
  /** @format date-time */
  deadline: string;
  status?: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";
  skills?: number[];
  interests?: number[];
}

export interface PasswordUpdateReq {
  /** @minLength 1 */
  currentPassword: string;
  /**
   * @minLength 4
   * @maxLength 20
   */
  newPassword: string;
  /**
   * @minLength 4
   * @maxLength 20
   */
  newPasswordConfirm: string;
}

export interface PasswordResetReq {
  username?: string;
  email?: string;
  newPassword?: string;
  newPasswordConfirm?: string;
}

export interface EvaluationUpdateReq {
  /** @format int64 */
  evaluationId: number;
  ratings: Ratings;
  comment?: string;
}

export interface ApiResponseListSkillDto {
  resultCode: string;
  msg: string;
  data: SkillDto[];
}

export interface ProjectSearchDto {
  keywordType?: string;
  keyword?: string;
  skillIds?: number[];
  interestIds?: number[];
  status?: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";
  empty?: boolean;
}

export interface Pageable {
  /**
   * @format int32
   * @min 0
   */
  page?: number;
  /**
   * @format int32
   * @min 1
   */
  size?: number;
  sort?: string[];
}

export interface ApiResponsePageProjectSummaryDto {
  resultCode: string;
  msg: string;
  data: PageProjectSummaryDto;
}

export interface PageProjectSummaryDto {
  /** @format int32 */
  totalPages?: number;
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  size?: number;
  content?: ProjectSummaryDto[];
  /** @format int32 */
  number?: number;
  sort?: SortObject;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  empty?: boolean;
}

export interface PageableObject {
  /** @format int64 */
  offset?: number;
  sort?: SortObject;
  /** @format int32 */
  pageSize?: number;
  /** @format int32 */
  pageNumber?: number;
  paged?: boolean;
  unpaged?: boolean;
}

export interface ProjectSummaryDto {
  /** @format int64 */
  id?: number;
  title?: string;
  summary?: string;
  status?: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";
  ownerName?: string;
  duration?: string;
  price?: number;
  /** @format date */
  deadline?: string;
  /** @format date-time */
  createDate?: string;
  skills?: SkillDto[];
  interests?: InterestDto[];
}

export interface SortObject {
  empty?: boolean;
  sorted?: boolean;
  unsorted?: boolean;
}

export interface ApiResponseListProposalDto {
  resultCode: string;
  msg: string;
  data: ProposalDto[];
}

export interface ApiResponsePageApplicationSummaryDto {
  resultCode: string;
  msg: string;
  data: PageApplicationSummaryDto;
}

export interface ApplicationSummaryDto {
  /** @format int64 */
  id?: number;
  estimatedPay?: number;
  expectedDuration?: string;
  workPlan?: string;
  status?: "WAIT" | "ACCEPT" | "DENIED";
  freelancerName?: string;
  /** @format int64 */
  freelancerId?: number;
  projectTitle?: string;
  /** @format int64 */
  projectId?: number;
  /** @format date-time */
  createDate?: string;
}

export interface PageApplicationSummaryDto {
  /** @format int32 */
  totalPages?: number;
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  size?: number;
  content?: ApplicationSummaryDto[];
  /** @format int32 */
  number?: number;
  sort?: SortObject;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  empty?: boolean;
}

export interface ApiResponseProfileResponseDto {
  resultCode: string;
  msg: string;
  data: ProfileResponseDto;
}

export interface ProfileResponseDto {
  username?: string;
  name?: string;
  role?: "CLIENT" | "FREELANCER" | "ADMIN";
  /** @format date-time */
  createdAt?: string;
  profileImgUrl?: string;
  /** @format double */
  ratingAvg?: number;
  job?: string;
  career?: Record<string, number>;
  freelancerEmail?: string;
  comment?: string;
  skills?: string[];
  interests?: string[];
  companySize?: string;
  companyDescription?: string;
  representative?: string;
  businessNo?: string;
  companyPhone?: string;
  companyEmail?: string;
}

export interface ApiResponseListProjectSummaryDto {
  resultCode: string;
  msg: string;
  data: ProjectSummaryDto[];
}

export interface ApiResponseListApplicationSummaryDto {
  resultCode: string;
  msg: string;
  data: ApplicationSummaryDto[];
}

export interface ApiResponseListInterestDto {
  resultCode: string;
  msg: string;
  data: InterestDto[];
}

export interface ApiResponsePageFreelancerSummary {
  resultCode: string;
  msg: string;
  data: PageFreelancerSummary;
}

export interface FreelancerSummary {
  /** @format int64 */
  id?: number;
  name?: string;
  careerLevel?: "NEWBIE" | "JUNIOR" | "MID" | "SENIOR" | "UNDEFINED";
  /** @format double */
  ratingAvg?: number;
  skills?: SkillDto[];
}

export interface PageFreelancerSummary {
  /** @format int32 */
  totalPages?: number;
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  size?: number;
  content?: FreelancerSummary[];
  /** @format int32 */
  number?: number;
  sort?: SortObject;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  empty?: boolean;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://localhost:8080",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title API 서버
 * @version beta
 * @baseUrl http://localhost:8080
 *
 * 프리랜서 매칭 API 서버 문서입니다.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags ApiV1FreelancerController
     * @name UpdateFreelancer
     * @summary 프리랜서 개인정보 수정
     * @request PUT:/api/v1/freelancers/{id}
     */
    updateFreelancer: (
      id: number,
      data: FreelancerUpdateForm,
      params: RequestParams = {},
    ) =>
      this.request<ApiResponseFreelancerUpdateResponse, ApiResponseVoid>({
        path: `/api/v1/freelancers/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags client-controller
     * @name UpdateClient
     * @request PUT:/api/v1/clients/{id}
     */
    updateClient: (
      id: number,
      data: ClientUpdateForm,
      params: RequestParams = {},
    ) =>
      this.request<ApiResponseClientUpdateResponse, ApiResponseVoid>({
        path: `/api/v1/clients/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api-v-1-project-controller
     * @name SearchProjects
     * @request GET:/api/v1/projects
     */
    searchProjects: (
      query: {
        searchDto: ProjectSearchDto;
        pageable: Pageable;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiResponsePageProjectSummaryDto, ApiResponseVoid>({
        path: `/api/v1/projects`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api-v-1-project-controller
     * @name Write
     * @request POST:/api/v1/projects
     */
    write: (data: ProjectWriteReqBody, params: RequestParams = {}) =>
      this.request<ApiResponseProjectDto, ApiResponseVoid>({
        path: `/api/v1/projects`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ApiV1ProposalController
     * @name GetProposals
     * @summary 프로젝트에 해당하는 제안서 목록 조회
     * @request GET:/api/v1/projects/{projectId}/proposals
     */
    getProposals: (projectId: number, params: RequestParams = {}) =>
      this.request<ApiResponseListProposalDto, ApiResponseVoid>({
        path: `/api/v1/projects/${projectId}/proposals`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ApiV1ProposalController
     * @name Create
     * @summary 프로젝트에 제안서 등록
     * @request POST:/api/v1/projects/{projectId}/proposals
     * @secure
     */
    create: (
      projectId: number,
      data: ProposalWriteReqBody,
      params: RequestParams = {},
    ) =>
      this.request<ApiResponseProposalDto, ApiResponseVoid>({
        path: `/api/v1/projects/${projectId}/proposals`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api-v-1-application-controller
     * @name GetAll
     * @request GET:/api/v1/projects/{projectId}/applications
     */
    getAll: (
      projectId: number,
      query: {
        pageable: Pageable;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiResponsePageApplicationSummaryDto, ApiResponseVoid>({
        path: `/api/v1/projects/${projectId}/applications`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api-v-1-application-controller
     * @name Create1
     * @request POST:/api/v1/projects/{projectId}/applications
     */
    create1: (
      projectId: number,
      data: ApplicationWriteReqBody,
      params: RequestParams = {},
    ) =>
      this.request<ApiResponseApplicationDto, ApiResponseVoid>({
        path: `/api/v1/projects/${projectId}/applications`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags member-controller
     * @name Join
     * @request POST:/api/v1/members
     */
    join: (data: MemberJoinReq, params: RequestParams = {}) =>
      this.request<ApiResponseMemberDto, ApiResponseVoid>({
        path: `/api/v1/members`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags member-controller
     * @name VerifyPasswordResetCode
     * @request POST:/api/v1/members/password-reset/verification
     */
    verifyPasswordResetCode: (
      data: PasswordResetVerifyReq,
      params: RequestParams = {},
    ) =>
      this.request<ApiResponseVoid, ApiResponseVoid>({
        path: `/api/v1/members/password-reset/verification`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags member-controller
     * @name SendPasswordResetCode
     * @request POST:/api/v1/members/password-reset/email
     */
    sendPasswordResetCode: (
      data: PasswordResetEmailReq,
      params: RequestParams = {},
    ) =>
      this.request<ApiResponseVoid, ApiResponseVoid>({
        path: `/api/v1/members/password-reset/email`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags member-controller
     * @name VerifyJoinCode
     * @request POST:/api/v1/members/join/verification
     */
    verifyJoinCode: (data: JoinVerifyReq, params: RequestParams = {}) =>
      this.request<ApiResponseVoid, ApiResponseVoid>({
        path: `/api/v1/members/join/verification`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags member-controller
     * @name SendJoinCode
     * @request POST:/api/v1/members/join/email
     */
    sendJoinCode: (data: JoinEmailReq, params: RequestParams = {}) =>
      this.request<ApiResponseVoid, ApiResponseVoid>({
        path: `/api/v1/members/join/email`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags evaluation-controller
     * @name CreateEvaluation
     * @request POST:/api/v1/evaluations
     */
    createEvaluation: (data: EvaluationCreateReq, params: RequestParams = {}) =>
      this.request<ApiResponseEvaluationResponse, ApiResponseVoid>({
        path: `/api/v1/evaluations`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags evaluation-controller
     * @name UpdateEvaluation
     * @request PATCH:/api/v1/evaluations
     */
    updateEvaluation: (data: EvaluationUpdateReq, params: RequestParams = {}) =>
      this.request<ApiResponseEvaluationResponse, ApiResponseVoid>({
        path: `/api/v1/evaluations`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name Logout
     * @request POST:/api/v1/auth/logout
     */
    logout: (params: RequestParams = {}) =>
      this.request<ApiResponseVoid, ApiResponseVoid>({
        path: `/api/v1/auth/logout`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name Login
     * @request POST:/api/v1/auth/login
     */
    login: (data: MemberLoginReq, params: RequestParams = {}) =>
      this.request<ApiResponseMemberDto, ApiResponseVoid>({
        path: `/api/v1/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ApiV1ProposalController
     * @name GetProposal
     * @summary 프로젝트에 해당하는 특정 ID 제안서를 조회
     * @request GET:/api/v1/projects/{projectId}/proposals/{proposalId}
     * @secure
     */
    getProposal: (
      projectId: number,
      proposalId: number,
      params: RequestParams = {},
    ) =>
      this.request<ApiResponseProposalDto, ApiResponseVoid>({
        path: `/api/v1/projects/${projectId}/proposals/${proposalId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ApiV1ProposalController
     * @name Delete
     * @summary 프로젝트에 해당하는 특정 ID 제안서 삭제
     * @request DELETE:/api/v1/projects/{projectId}/proposals/{proposalId}
     * @secure
     */
    delete: (
      projectId: number,
      proposalId: number,
      params: RequestParams = {},
    ) =>
      this.request<ApiResponseVoid, ApiResponseVoid>({
        path: `/api/v1/projects/${projectId}/proposals/${proposalId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ApiV1ProposalController
     * @name UpdateState
     * @summary 프로젝트에 해당하는 특정 ID 제안서의 상태 변경
     * @request PATCH:/api/v1/projects/{projectId}/proposals/{proposalId}
     * @secure
     */
    updateState: (
      projectId: number,
      proposalId: number,
      data: ProposalStateUpdateReqBody,
      params: RequestParams = {},
    ) =>
      this.request<ApiResponseProposalDto, ApiResponseVoid>({
        path: `/api/v1/projects/${projectId}/proposals/${proposalId}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api-v-1-application-controller
     * @name Get
     * @request GET:/api/v1/projects/{projectId}/applications/{id}
     */
    get: (projectId: number, id: number, params: RequestParams = {}) =>
      this.request<ApiResponseApplicationDto, ApiResponseVoid>({
        path: `/api/v1/projects/${projectId}/applications/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api-v-1-application-controller
     * @name Delete1
     * @request DELETE:/api/v1/projects/{projectId}/applications/{id}
     */
    delete1: (projectId: number, id: number, params: RequestParams = {}) =>
      this.request<ApiResponseVoid, ApiResponseVoid>({
        path: `/api/v1/projects/${projectId}/applications/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api-v-1-application-controller
     * @name Update
     * @request PATCH:/api/v1/projects/{projectId}/applications/{id}
     */
    update: (
      projectId: number,
      id: number,
      data: ApplicationModifyReqBody,
      params: RequestParams = {},
    ) =>
      this.request<ApiResponseApplicationDto, ApiResponseVoid>({
        path: `/api/v1/projects/${projectId}/applications/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api-v-1-project-controller
     * @name GetItem
     * @request GET:/api/v1/projects/{id}
     */
    getItem: (id: number, params: RequestParams = {}) =>
      this.request<ProjectDto, ApiResponseVoid>({
        path: `/api/v1/projects/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api-v-1-project-controller
     * @name Delete2
     * @request DELETE:/api/v1/projects/{id}
     */
    delete2: (id: number, params: RequestParams = {}) =>
      this.request<ApiResponseVoid, ApiResponseVoid>({
        path: `/api/v1/projects/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api-v-1-project-controller
     * @name Modify
     * @request PATCH:/api/v1/projects/{id}
     */
    modify: (
      id: number,
      data: ProjectModifyReqBody,
      params: RequestParams = {},
    ) =>
      this.request<ApiResponseProjectDto, ApiResponseVoid>({
        path: `/api/v1/projects/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags member-controller
     * @name UpdatePassword
     * @request PATCH:/api/v1/members/password
     */
    updatePassword: (data: PasswordUpdateReq, params: RequestParams = {}) =>
      this.request<ApiResponseVoid, ApiResponseVoid>({
        path: `/api/v1/members/password`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags member-controller
     * @name PasswordReset
     * @request PATCH:/api/v1/members/password-reset
     */
    passwordReset: (data: PasswordResetReq, params: RequestParams = {}) =>
      this.request<ApiResponseVoid, ApiResponseVoid>({
        path: `/api/v1/members/password-reset`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags member-controller
     * @name UpdateMyProfile
     * @request PATCH:/api/v1/members/me/profile
     */
    updateMyProfile: (data: Record<string, any>, params: RequestParams = {}) =>
      this.request<ApiResponseVoid, ApiResponseVoid>({
        path: `/api/v1/members/me/profile`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-test-controller
     * @name PublicEndpoint
     * @request GET:/api/v1/test/public
     */
    publicEndpoint: (params: RequestParams = {}) =>
      this.request<ApiResponseVoid, ApiResponseVoid>({
        path: `/api/v1/test/public`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-test-controller
     * @name AuthenticatedUserEndpoint
     * @request GET:/api/v1/test/auth
     */
    authenticatedUserEndpoint: (params: RequestParams = {}) =>
      this.request<ApiResponseMemberDto, ApiResponseVoid>({
        path: `/api/v1/test/auth`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-test-controller
     * @name MyInfo
     * @request GET:/api/v1/test/auth/me
     */
    myInfo: (params: RequestParams = {}) =>
      this.request<ApiResponseMemberDto, ApiResponseVoid>({
        path: `/api/v1/test/auth/me`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-test-controller
     * @name FreelanceEndpoint
     * @request GET:/api/v1/test/auth/freelancer
     */
    freelanceEndpoint: (params: RequestParams = {}) =>
      this.request<ApiResponseMemberDto, ApiResponseVoid>({
        path: `/api/v1/test/auth/freelancer`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-test-controller
     * @name ClientEndpoint
     * @request GET:/api/v1/test/auth/client
     */
    clientEndpoint: (params: RequestParams = {}) =>
      this.request<ApiResponseMemberDto, ApiResponseVoid>({
        path: `/api/v1/test/auth/client`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-test-controller
     * @name AdminEndpoint
     * @request GET:/api/v1/test/auth/admin
     */
    adminEndpoint: (params: RequestParams = {}) =>
      this.request<ApiResponseMemberDto, ApiResponseVoid>({
        path: `/api/v1/test/auth/admin`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ApiV1SkillController
     * @name FindAll
     * @request GET:/api/v1/skills
     */
    findAll: (params: RequestParams = {}) =>
      this.request<ApiResponseListSkillDto, ApiResponseVoid>({
        path: `/api/v1/skills`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api-v-1-application-controller
     * @name GetAllMe
     * @request GET:/api/v1/projects/{projectId}/applications/me
     */
    getAllMe: (
      projectId: number,
      query: {
        pageable: Pageable;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiResponsePageApplicationSummaryDto, ApiResponseVoid>({
        path: `/api/v1/projects/${projectId}/applications/me`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api-v-1-project-controller
     * @name GetItems
     * @request GET:/api/v1/projects/all
     */
    getItems: (params: RequestParams = {}) =>
      this.request<ProjectDto[], ApiResponseVoid>({
        path: `/api/v1/projects/all`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags member-controller
     * @name GetProfile
     * @request GET:/api/v1/members/{userId}/profile
     */
    getProfile: (userId: number, params: RequestParams = {}) =>
      this.request<ApiResponseProfileResponseDto, ApiResponseVoid>({
        path: `/api/v1/members/${userId}/profile`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags member-controller
     * @name GetMyProfile
     * @request GET:/api/v1/members/me
     */
    getMyProfile: (params: RequestParams = {}) =>
      this.request<ApiResponseProfileResponseDto, ApiResponseVoid>({
        path: `/api/v1/members/me`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags member-controller
     * @name GetMyProjects
     * @request GET:/api/v1/members/me/projects
     */
    getMyProjects: (params: RequestParams = {}) =>
      this.request<ApiResponseListProjectSummaryDto, ApiResponseVoid>({
        path: `/api/v1/members/me/projects`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags member-controller
     * @name GetMyApplications
     * @request GET:/api/v1/members/me/applications
     */
    getMyApplications: (params: RequestParams = {}) =>
      this.request<ApiResponseListApplicationSummaryDto, ApiResponseVoid>({
        path: `/api/v1/members/me/applications`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ApiV1InterestController
     * @name FindAll1
     * @request GET:/api/v1/interests
     */
    findAll1: (params: RequestParams = {}) =>
      this.request<ApiResponseListInterestDto, ApiResponseVoid>({
        path: `/api/v1/interests`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ApiV1FreelancerController
     * @name GetFreelancers
     * @summary 프리랜서 목록 조회
     * @request GET:/api/v1/freelancers
     */
    getFreelancers: (
      query: {
        careerLevel?: string;
        /** @format float */
        ratingAvg?: number;
        skillIds?: string;
        pageable: Pageable;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiResponsePageFreelancerSummary, ApiResponseVoid>({
        path: `/api/v1/freelancers`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
}
