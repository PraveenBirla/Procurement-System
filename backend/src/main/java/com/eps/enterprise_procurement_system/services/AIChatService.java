package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.ChatRequestDTO;
import com.eps.enterprise_procurement_system.dto.ChatResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIChatService {

    @Value("${groq.api.key}")
    private String groqApiKey;

    private final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    public ChatResponseDTO getChatbotResponse(ChatRequestDTO requestDTO) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        // Construct the prompt context
        String role = requestDTO.getUserRole() != null && !requestDTO.getUserRole().isEmpty() 
            ? requestDTO.getUserRole() : "Guest/Unregistered User";
        String page = requestDTO.getPageContext() != null && !requestDTO.getPageContext().isEmpty() 
            ? requestDTO.getPageContext() : "Unknown Page";

        String systemPrompt = String.format(
            "You are a helpful AI assistant for the ProCure Procurement System. " +
            "The user you are helping has the role of '%s'. " +
            "They are currently on the '%s' page. " +
            "Help them navigate the application, answer questions about purchase requisitions, orders, and general procurement processes. " +
            "If they ask questions unrelated to the procurement system or their role, politely decline. " +
            "Keep your answers concise, professional, and directly related to the ProCure application.",
            role, page
        );

        // Construct request body
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "openai/gpt-oss-20b"); // using available model

        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemPrompt);
        messages.add(systemMessage);

        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", requestDTO.getUserMessage());
        messages.add(userMessage);

        requestBody.put("messages", messages);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_API_URL, entity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, String> message = (Map<String, String>) firstChoice.get("message");
                    return new ChatResponseDTO(message.get("content"));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ChatResponseDTO("I'm sorry, I encountered an error while trying to process your request. Please try again later.");
        }

        return new ChatResponseDTO("I'm sorry, I couldn't generate a response.");
    }
}
