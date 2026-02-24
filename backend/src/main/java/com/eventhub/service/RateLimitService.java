package com.eventhub.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService {
    private final RedisTemplate<String, Integer> redisTemplate;
    private static final int MAX_REQUESTS = 3;
    private static final long EXPIRATION_MINUTES = 60;
    
    public boolean isRateLimited(String email, String ipAddress) {
        try {
            String emailKey = "rate_limit:email:" + email;
            String ipKey = "rate_limit:ip:" + ipAddress;
            
            Integer emailCount = redisTemplate.opsForValue().get(emailKey);
            Integer ipCount = redisTemplate.opsForValue().get(ipKey);
            
            return (emailCount != null && emailCount >= MAX_REQUESTS) || 
                   (ipCount != null && ipCount >= MAX_REQUESTS);
        } catch (Exception e) {
            log.warn("Redis rate limiting unavailable, allowing request: {}", e.getMessage());
            return false;
        }
    }
    
    public void incrementRateLimitCounter(String email, String ipAddress) {
        try {
            String emailKey = "rate_limit:email:" + email;
            String ipKey = "rate_limit:ip:" + ipAddress;
            
            redisTemplate.opsForValue().increment(emailKey);
            redisTemplate.expire(emailKey, EXPIRATION_MINUTES, TimeUnit.MINUTES);
            
            redisTemplate.opsForValue().increment(ipKey);
            redisTemplate.expire(ipKey, EXPIRATION_MINUTES, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.warn("Redis rate limiting unavailable: {}", e.getMessage());
        }
    }
}
