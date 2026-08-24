package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.dto.ChatRequestDTO;
import com.eps.enterprise_procurement_system.dto.ChatResponseDTO;
import com.eps.enterprise_procurement_system.services.AIChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AIChatController {

    @Autowired
    private AIChatService aiChatService;

    @PostMapping
    public ResponseEntity<ChatResponseDTO> getChatbotResponse(@RequestBody ChatRequestDTO requestDTO) {
        ChatResponseDTO response = aiChatService.getChatbotResponse(requestDTO);
        return ResponseEntity.ok(response);
    }
}
