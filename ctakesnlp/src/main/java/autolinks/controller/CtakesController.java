package autolinks.controller;

import autolinks.model.*;
import org.apache.ctakes.core.cc.pretty.plaintext.PrettyTextWriter;
import org.apache.ctakes.typesystem.type.textspan.Sentence;
import org.apache.uima.analysis_engine.AnalysisEngine;
import org.apache.uima.cas.Feature;
import org.apache.uima.cas.FeatureStructure;
import org.apache.uima.fit.factory.AggregateBuilder;
import org.apache.uima.fit.util.JCasUtil;
import org.apache.uima.jcas.JCas;
import org.apache.uima.jcas.cas.FSArray;
import org.apache.uima.jcas.cas.TOP;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.PostConstruct;
import javax.servlet.ServletException;
import java.io.BufferedWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@RestController
public class CtakesController {
    // Reuse the pipeline for demo purposes
    private static AnalysisEngine pipeline;

//    @PostConstruct
//    public void init2() throws ServletException {
//        AggregateBuilder aggregateBuilder;
//        try {
//            aggregateBuilder = Pipeline.getAggregateBuilder();
//            pipeline = aggregateBuilder.createAggregate();
//        } catch (Exception e) {
//            throw new ServletException(e);
//        }
//    }

    @PostMapping("/analyse")
    public ResponseEntity analyse(@RequestBody MyRequest request) throws ServletException {
        if(pipeline == null) {
            AggregateBuilder aggregateBuilder;
            try {
                aggregateBuilder = Pipeline.getAggregateBuilder();
                pipeline = aggregateBuilder.createAggregate();
            } catch (Exception e) {
                throw new ServletException(e);
            }
        }

        String text = request.getQuery();
        String result;
        MyAnalysis analysis;

        if (text != null && text.trim().length() > 0) {
            try {
                /*
                 * Set the document text to process And run the cTAKES pipeline
                 */
                JCas jcas = pipeline.newJCas();
                jcas.setDocumentText(text);
                pipeline.process(jcas);
                analysis = extract(jcas);
                analysis.setSource(text);
                result = formatResults(jcas);
                jcas.reset();

                System.out.println(result);
            } catch (Exception e) {
                throw new ServletException(e);
            }
            //return ResponseEntity.status(HttpStatus.OK).body(result);
            return ResponseEntity.status(HttpStatus.OK).body(analysis);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Query Error");
    }

    private String formatResults(JCas jcas) throws Exception {
        StringBuffer sb = new StringBuffer();

        StringWriter sw = new StringWriter();
        BufferedWriter writer = new BufferedWriter(sw);
        Collection<Sentence> sentences = JCasUtil.select(jcas,
                Sentence.class);
        for (Sentence sentence : sentences) {
            PrettyTextWriter.writeSentence(jcas, sentence, writer);
        }
        writer.close();
        sb.append(sw.toString());

        return sb.toString();
    }

    private MyAnalysis extract(JCas jcas) {
        MyAnalysis analysis = new MyAnalysis();
        List<MyAnnotation> annotationList = new ArrayList<>();

        Collection<TOP> annotations = JCasUtil.selectAll(jcas);
        for (TOP a : annotations) {
            MyAnnotation annotation = new MyAnnotation();
            annotation.setType(a.getType().getShortName());
            annotation.setOffset(new MyOffset());

            List<MyProperty> properties = new ArrayList<>();
            extractProperties(properties, a, annotation);
            annotation.setProperties(properties);

            annotationList.add(annotation);
        }

        analysis.setAnnotations(annotationList);
        return analysis;
    }

    private void extractProperties(List<MyProperty> properties, FeatureStructure a, MyAnnotation annotation) {
        for(Feature feature : a.getType().getFeatures()) {
            // Get Value
            String val = null;
            if (feature.getRange().isPrimitive()) {
                val = a.getFeatureValueAsString(feature);
            } else if (feature.getRange().isArray()) {
                // Flatten the Arrays
                FeatureStructure featval = a.getFeatureValue(feature);
                if (featval instanceof FSArray) {
                    FSArray valarray = (FSArray) featval;
                    for (int i = 0; i < valarray.size(); ++i) {
                        FeatureStructure temp = valarray.get(i);
                        extractProperties(properties, temp, annotation);
                    }
                }
            }

            // Get name
            String name = null;
            if (feature.getName() != null
                    && val != null
                    && val.trim().length() > 0
                    && !"confidence".equalsIgnoreCase(feature
                    .getShortName())) {
                name = feature.getShortName();
            }

            // Create offset or new property
            if(name != null) {
                if(name.equals("begin") ) {
                    annotation.getOffset().setFrom(Integer.parseInt(val));
                } else if(name.equals("end")) {
                    annotation.getOffset().setTo(Integer.parseInt(val));
                } else {
                    MyProperty property = new MyProperty();
                    property.setName(name);
                    property.setValue(val);
                    properties.add(property);
                }
            }
        }
    }
}
