import axiosInstance, { parseHtmlResponse } from "../utils/axiosWithCookies";
import { AxiosRequestConfig } from "axios";

/**
 * API 서비스
 */
const apiService = {
	/**
	 * GET 요청
	 * @param endpoint API 엔드포인트
	 * @param config axios 설정
	 * @returns 응답 데이터
	 */
	get: async (endpoint: string, config?: AxiosRequestConfig) => {
		try {
			const response = await axiosInstance.get(endpoint, config);
			return response.data;
		} catch (error) {
			console.error(`GET 요청 오류 (${endpoint}):`, error);
			throw error;
		}
	},

	/**
	 * POST 요청
	 * @param endpoint API 엔드포인트
	 * @param data 요청 데이터
	 * @param config axios 설정
	 * @returns 응답 데이터
	 */
	post: async (endpoint: string, data: any, config?: AxiosRequestConfig) => {
		try {
			const response = await axiosInstance.post(endpoint, data, config);
			return response.data;
		} catch (error) {
			console.error(`POST 요청 오류 (${endpoint}):`, error);
			throw error;
		}
	},

	/**
	 * HTML 응답을 파싱하는 GET 요청
	 * @param endpoint API 엔드포인트
	 * @param config axios 설정
	 * @returns 파싱된 HTML 데이터
	 */
	getHTML: async (endpoint: string, config?: AxiosRequestConfig) => {
		try {
			const response = await axiosInstance.get(endpoint, {
				...config,
				responseType: "text",
			});
			return parseHtmlResponse(response.data);
		} catch (error) {
			console.error(`HTML GET 요청 오류 (${endpoint}):`, error);
			throw error;
		}
	},

	/**
	 * HTML 응답을 파싱하는 POST 요청
	 * @param endpoint API 엔드포인트
	 * @param data 요청 데이터
	 * @param config axios 설정
	 * @returns 파싱된 HTML 데이터
	 */
	postHTML: async (
		endpoint: string,
		data: any,
		config?: AxiosRequestConfig
	) => {
		try {
			const response = await axiosInstance.post(endpoint, data, {
				...config,
				responseType: "text",
			});
			return parseHtmlResponse(response.data);
		} catch (error) {
			console.error(`HTML POST 요청 오류 (${endpoint}):`, error);
			throw error;
		}
	},
};

export default apiService;
