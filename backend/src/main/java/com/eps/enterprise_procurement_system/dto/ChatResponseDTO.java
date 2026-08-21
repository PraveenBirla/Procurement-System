package com.eps.enterprise_procurement_system.dto;

public class ChatResponseDTO {
    private String aiReply;

    public ChatResponseDTO() {
    }

    public ChatResponseDTO(String aiReply) {
        this.aiReply = aiReply;
    }

    public String getAiReply() {
        return aiReply;
    }

    public void setAiReply(String aiReply) {
        this.aiReply = aiReply;
    }
}
