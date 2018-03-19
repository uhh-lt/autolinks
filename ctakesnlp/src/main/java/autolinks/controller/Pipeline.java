package autolinks.controller;

import org.apache.ctakes.clinicalpipeline.ClinicalPipelineFactory;
import org.apache.ctakes.dictionary.lookup2.ae.AbstractJCasTermAnnotator;
import org.apache.ctakes.dictionary.lookup2.ae.DefaultJCasTermAnnotator;
import org.apache.ctakes.dictionary.lookup2.ae.JCasTermAnnotator;
import org.apache.uima.fit.factory.AggregateBuilder;
import org.apache.uima.fit.factory.AnalysisEngineFactory;

import java.io.File;
import java.net.URL;

public class Pipeline {

    public static AggregateBuilder getAggregateBuilder() throws Exception {
//        URL url = ClassLoader.getSystemClassLoader().getResource("/org/apache/ctakes/dictionary/lookup/fast/sno_rx_16ab.xml");
//
        URL url = System.class.getResource("/org/apache/ctakes/dictionary/lookup/fast/sno_rx_16ab.xml");
        System.out.println(new File(url.toURI()).exists());
        System.out.println(url.toURI());
        System.out.println(url.getFile());
        System.out.println(url.toString());

        AggregateBuilder builder = new AggregateBuilder();
        //builder.add(ClinicalPipelineFactory.getFastPipeline());
        builder.add( ClinicalPipelineFactory.getTokenProcessingPipeline() );
        builder.add( AnalysisEngineFactory.createEngineDescription( DefaultJCasTermAnnotator.class,
                AbstractJCasTermAnnotator.PARAM_WINDOW_ANNOT_KEY,
                "org.apache.ctakes.typesystem.type.textspan.Sentence",
                JCasTermAnnotator.DICTIONARY_DESCRIPTOR_KEY,
                //"/org/apache/ctakes/dictionary/lookup/fast/sno_rx_16ab.xml")
                url.getFile())
        );
//	      builder.add( PolarityCleartkAnalysisEngine.createAnnotatorDescription() );
//	      builder.add( UncertaintyCleartkAnalysisEngine.createAnnotatorDescription() );
//	      builder.add( HistoryCleartkAnalysisEngine.createAnnotatorDescription() );
//	      builder.add( ConditionalCleartkAnalysisEngine.createAnnotatorDescription() );
//	      builder.add( GenericCleartkAnalysisEngine.createAnnotatorDescription() );
//	      builder.add( SubjectCleartkAnalysisEngine.createAnnotatorDescription() );
        return builder;
    }
}