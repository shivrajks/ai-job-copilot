package com.aicopilot.service;

import com.aicopilot.dto.ApplicationDtos;
import com.aicopilot.dto.ApplicationDtos.*;
import com.aicopilot.entity.Application;
import com.aicopilot.entity.Resume;
import com.aicopilot.entity.User;
import com.aicopilot.exception.AppException;
import com.aicopilot.repository.ApplicationRepository;
import com.aicopilot.repository.ResumeRepository;
import com.aicopilot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;

    @Transactional
    public ApplicationDetail createApplication(CreateRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Resume resume = null;
        if (request.getResumeId() != null) {
            resume = resumeRepository.findById(request.getResumeId())
                    .orElseThrow(() -> new AppException("Resume not found", HttpStatus.NOT_FOUND));
            if (!resume.getUser().getId().equals(user.getId())) {
                throw new AppException("Access denied", HttpStatus.FORBIDDEN);
            }
        }

        Application.Stage stage;
        try {
            stage = Application.Stage.valueOf(request.getStage().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException("Invalid stage: " + request.getStage(), HttpStatus.BAD_REQUEST);
        }

        Application application = Application.builder()
                .user(user)
                .resume(resume)
                .company(request.getCompany())
                .role(request.getRole())
                .location(request.getLocation())
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .jobUrl(request.getJobUrl())
                .stage(stage)
                .appliedAt(request.getAppliedAt())
                .notes(request.getNotes())
                .build();

        application = applicationRepository.save(application);

        log.info("Created application: {} for user: {} at {}", application.getId(), userId, application.getCompany());

        return ApplicationDtos.toDetail(application);
    }

    @Transactional(readOnly = true)
    public List<ApplicationListItem> listUserApplications(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        List<Application> applications = applicationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        return applications.stream()
                .map(ApplicationDtos::toListItem)
                .toList();
    }

    @Transactional(readOnly = true)
    public ApplicationDetail getApplication(UUID userId, UUID applicationId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));

        if (!application.getUser().getId().equals(user.getId())) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        return ApplicationDtos.toDetail(application);
    }

    @Transactional
    public ApplicationDetail updateApplication(UUID userId, UUID applicationId, UpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));

        if (!application.getUser().getId().equals(user.getId())) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        Resume resume = null;
        if (request.getResumeId() != null) {
            resume = resumeRepository.findById(request.getResumeId())
                    .orElseThrow(() -> new AppException("Resume not found", HttpStatus.NOT_FOUND));
            if (!resume.getUser().getId().equals(user.getId())) {
                throw new AppException("Access denied", HttpStatus.FORBIDDEN);
            }
        }

        Application.Stage stage = application.getStage();
        if (request.getStage() != null) {
            try {
                stage = Application.Stage.valueOf(request.getStage().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new AppException("Invalid stage: " + request.getStage(), HttpStatus.BAD_REQUEST);
            }
        }

        application.setCompany(request.getCompany());
        application.setRole(request.getRole());
        application.setLocation(request.getLocation());
        application.setSalaryMin(request.getSalaryMin());
        application.setSalaryMax(request.getSalaryMax());
        application.setJobUrl(request.getJobUrl());
        application.setResume(resume);
        application.setStage(stage);
        application.setNotes(request.getNotes());
        application.setAppliedAt(request.getAppliedAt());

        application = applicationRepository.save(application);

        log.info("Updated application: {} for user: {}", applicationId, userId);

        return ApplicationDtos.toDetail(application);
    }

    @Transactional
    public ApplicationDetail updateApplicationStage(UUID userId, UUID applicationId, StageUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));

        if (!application.getUser().getId().equals(user.getId())) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        Application.Stage stage;
        try {
            stage = Application.Stage.valueOf(request.getStage().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException("Invalid stage: " + request.getStage(), HttpStatus.BAD_REQUEST);
        }

        // Auto-set appliedAt when transitioning to APPLIED
        if (stage == Application.Stage.APPLIED && application.getAppliedAt() == null) {
            application.setAppliedAt(java.time.LocalDateTime.now());
        }

        application.setStage(stage);
        application = applicationRepository.save(application);

        log.info("Updated stage for application: {} to {} for user: {}", applicationId, stage, userId);

        return ApplicationDtos.toDetail(application);
    }

    @Transactional
    public void deleteApplication(UUID userId, UUID applicationId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));

        if (!application.getUser().getId().equals(user.getId())) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        applicationRepository.delete(application);

        log.info("Deleted application: {} for user: {}", applicationId, userId);
    }

    @Transactional
    public List<ApplicationDetail> batchUpdateStage(UUID userId, List<UUID> ids, String stage) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Application.Stage newStage;
        try {
            newStage = Application.Stage.valueOf(stage.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException("Invalid stage: " + stage, HttpStatus.BAD_REQUEST);
        }

        List<Application> applications = applicationRepository.findAllById(ids);
        List<ApplicationDetail> results = new java.util.ArrayList<>();

        for (Application app : applications) {
            if (!app.getUser().getId().equals(user.getId())) continue;

            if (newStage == Application.Stage.APPLIED && app.getAppliedAt() == null) {
                app.setAppliedAt(java.time.LocalDateTime.now());
            }
            app.setStage(newStage);
            applicationRepository.save(app);
            results.add(ApplicationDtos.toDetail(app));
        }

        log.info("Batch updated stage for {} applications to {} for user: {}", results.size(), stage, userId);
        return results;
    }

    @Transactional
    public void batchDelete(UUID userId, List<UUID> ids) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        List<Application> applications = applicationRepository.findAllById(ids);
        int deleted = 0;

        for (Application app : applications) {
            if (app.getUser().getId().equals(user.getId())) {
                applicationRepository.delete(app);
                deleted++;
            }
        }

        log.info("Batch deleted {} applications for user: {}", deleted, userId);
    }
}
