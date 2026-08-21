package com.eps.enterprise_procurement_system.dto;

public class ChatRequestDTO {
    private String userMessage;
    private String userRole;
    private String pageContext;

    public ChatRequestDTO() {
    }

    public ChatRequestDTO(String userMessage, String userRole, String pageContext) {
        this.userMessage = userMessage;
        this.userRole = userRole;
        this.pageContext = pageContext;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public String getPageContext() {
        return pageContext;
    }

    public void setPageContext(String pageContext) {
        this.pageContext = pageContext;
    }
}
