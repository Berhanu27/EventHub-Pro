package com.eventhub.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    
    @GetMapping
    public ResponseEntity<List<String>> getCategories() {
        List<String> categories = Arrays.asList(
            "Technology",
            "Business",
            "Arts & Culture",
            "Sports",
            "Education",
            "Health & Wellness",
            "Music",
            "Food & Drink",
            "Networking",
            "Other"
        );
        return ResponseEntity.ok(categories);
    }
}
