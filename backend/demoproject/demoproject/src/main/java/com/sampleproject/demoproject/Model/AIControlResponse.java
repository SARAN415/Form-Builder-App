package com.sampleproject.demoproject.Model;

import tools.jackson.databind.JsonNode;

import java.util.List;

public class AIControlResponse {

    private String action;

    private List<AIControl> controls;

    private Long selectedId;


    public AIControlResponse() {
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public List<AIControl> getControls() {
        return controls;
    }

    public void setControls(List<AIControl> controls) {
        this.controls = controls;
    }


    public Long getSelectedId() {
        return selectedId;
    }

    public void setSelectedId(Long selectedId) {
        this.selectedId = selectedId;
    }


    public static class AIControl {

        private Long id;
        private String input;
        private String type;
        private String label;
        private JsonNode options;
        private String placeholder;

        private Integer width;
        private Integer height;

        private Integer border;
        private String borderColor;
        private String backgroundColor;

        private Boolean required;
        private Boolean readable;

        private Integer x;
        private Integer y;

        private Long containerId;


        public AIControl() {
        }


        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }


        public String getInput() {
            return input;
        }

        public void setInput(String input) {
            this.input = input;
        }


        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }


        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }


        public JsonNode getOptions() {
            return options;
        }

        public void setOptions(JsonNode options) {
            this.options = options;
        }


        public String getPlaceholder() {
            return placeholder;
        }

        public void setPlaceholder(String placeholder) {
            this.placeholder = placeholder;
        }


        public Integer getWidth() {
            return width;
        }

        public void setWidth(Integer width) {
            this.width = width;
        }


        public Integer getHeight() {
            return height;
        }

        public void setHeight(Integer height) {
            this.height = height;
        }


        public Integer getBorder() {
            return border;
        }

        public void setBorder(Integer border) {
            this.border = border;
        }


        public String getBorderColor() {
            return borderColor;
        }

        public void setBorderColor(String borderColor) {
            this.borderColor = borderColor;
        }


        public String getBackgroundColor() {
            return backgroundColor;
        }

        public void setBackgroundColor(String backgroundColor) {
            this.backgroundColor = backgroundColor;
        }


        public Boolean getRequired() {
            return required;
        }

        public void setRequired(Boolean required) {
            this.required = required;
        }


        public Boolean getReadable() {
            return readable;
        }

        public void setReadable(Boolean readable) {
            this.readable = readable;
        }


        public Integer getX() {
            return x;
        }

        public void setX(Integer x) {
            this.x = x;
        }


        public Integer getY() {
            return y;
        }

        public void setY(Integer y) {
            this.y = y;
        }


        public Long getContainerId() {
            return containerId;
        }

        public void setContainerId(Long containerId) {
            this.containerId = containerId;
        }
    }
}