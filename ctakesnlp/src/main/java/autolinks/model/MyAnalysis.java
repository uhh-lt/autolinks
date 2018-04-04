package autolinks.model;

import java.util.List;

public class MyAnalysis {
    String source;
    List<MyAnnotation> annotations;

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public List<MyAnnotation> getAnnotations() {
        return annotations;
    }

    public void setAnnotations(List<MyAnnotation> annotations) {
        this.annotations = annotations;
    }
}
