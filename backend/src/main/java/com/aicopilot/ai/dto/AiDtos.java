package com.aicopilot.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public final class AiDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParseResponse {
        private String parsedContent;
        private String structuredData;
        private boolean success;
        private String errorMessage;

        public static ParseResponse success(String structuredData, String parsedContent) {
            return ParseResponse.builder()
                    .parsedContent(parsedContent)
                    .structuredData(structuredData)
                    .success(true)
                    .errorMessage(null)
                    .build();
        }

        public static ParseResponse failure(String errorMessage) {
            return ParseResponse.builder()
                    .parsedContent(null)
                    .structuredData(null)
                    .success(false)
                    .errorMessage(errorMessage)
                    .build();
        }
    }

    private AiDtos() {}
}
