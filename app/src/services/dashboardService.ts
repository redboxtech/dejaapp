import { environment } from "@config/environment";
import { homeSummaryMock } from "@mocks/index";
import { apiClient } from "@services/apiClient";
import type { HomeSummary } from "@types";

const MOCK_DELAY = 350;

const getHomeSummaryFromMock = async (): Promise<HomeSummary> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(homeSummaryMock), MOCK_DELAY);
  });

const getHomeSummaryFromApi = async (): Promise<HomeSummary> => {
  const response = await apiClient.get<HomeSummary>("/dashboard/home-summary");
  return response.data;
};

export const dashboardService = {
  async getHomeSummary(): Promise<HomeSummary> {
    if (environment.useMocks) {
      return getHomeSummaryFromMock();
    }

    return getHomeSummaryFromApi();
  }
};

