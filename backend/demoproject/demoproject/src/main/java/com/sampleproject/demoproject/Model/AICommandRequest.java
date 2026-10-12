package com.sampleproject.demoproject.Model;

import java.util.List;

public class AICommandRequest {

    private String prompt;

    private List<AIControlResponse.AIControl> controls;

    private Long selectedId;

    public AICommandRequest() {
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public List<AIControlResponse.AIControl> getControls() {
        return controls;
    }

    public void setControls(
            List<AIControlResponse.AIControl> controls
    ) {
        this.controls = controls;
    }

    public Long getSelectedId() {
        return selectedId;
    }

    public void setSelectedId(Long selectedId) {
        this.selectedId = selectedId;
    }
}