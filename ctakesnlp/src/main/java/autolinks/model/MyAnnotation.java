package autolinks.model;

import java.util.List;

public class MyAnnotation {
    String type;
    MyOffset offset;
    List<MyProperty> properties;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public MyOffset getOffset() {
        return offset;
    }

    public void setOffset(MyOffset offset) {
        this.offset = offset;
    }

    public List<MyProperty> getProperties() {
        return properties;
    }

    public void setProperties(List<MyProperty> properties) {
        this.properties = properties;
    }
}
