import java.io.File;

import org.gephi.appearance.api.AppearanceController;
import org.gephi.appearance.api.AppearanceModel;
import org.gephi.graph.api.GraphController;
import org.gephi.graph.api.GraphModel;
import org.gephi.io.importer.api.Container;
import org.gephi.io.importer.api.ImportController;
import org.gephi.io.processor.plugin.DefaultProcessor;
import org.gephi.layout.plugin.force.StepDisplacement;
import org.gephi.layout.plugin.force.yifanHu.YifanHuLayout;
import org.gephi.project.api.ProjectController;
import org.gephi.project.api.Workspace;
import org.openide.util.Lookup;
import java.io.IOException;
import org.gephi.io.exporter.api.ExportController;
//import org.gephi.io.exporter.spi.GraphExporter;
import java.awt.Color;
import org.gephi.appearance.api.Function;
import org.gephi.appearance.plugin.RankingElementColorTransformer;
import org.gephi.appearance.plugin.RankingNodeSizeTransformer;
import org.gephi.graph.api.DirectedGraph;

public class doLayout {
	doLayout(String filename){
		script(filename);
	}
	public void script(String filename){
		ProjectController pc = Lookup.getDefault().lookup(ProjectController.class);
        pc.newProject();
        Workspace workspace = pc.getCurrentWorkspace();

        //Get controllers and models
        ImportController importController = Lookup.getDefault().lookup(ImportController.class);
        GraphModel graphModel = Lookup.getDefault().lookup(GraphController.class).getGraphModel();
        AppearanceModel appearanceModel = Lookup.getDefault().lookup(AppearanceController.class).getModel();
        AppearanceController appearanceController = Lookup.getDefault().lookup(AppearanceController.class);

        //Import file
        Container container;
        //String filename2 = "steam_Zaruxx.gexf";
        System.out.println("Working Directory = " +
                System.getProperty("user.dir"));
        File f = new File(filename);
        if(f.exists() && !f.isDirectory()) { 
        	System.out.println("isfile");
        }
        try {
            File file = new File(filename);
            container = importController.importFile(file);
        } catch (Exception ex) {
            ex.printStackTrace();
            return;
        }

        //Append imported data to GraphAPI
        importController.process(container, new DefaultProcessor(), workspace);
        
        DirectedGraph graph = graphModel.getDirectedGraph();
        
        Function degreeRanking = appearanceModel.getNodeFunction(graph, AppearanceModel.GraphFunction.NODE_DEGREE, RankingElementColorTransformer.class);
        Function degreeRankingSize = appearanceModel.getNodeFunction(graph, AppearanceModel.GraphFunction.NODE_DEGREE, RankingNodeSizeTransformer.class);
        RankingElementColorTransformer degreeTransformer = (RankingElementColorTransformer) degreeRanking.getTransformer();
        RankingNodeSizeTransformer degreeTransformerSize = (RankingNodeSizeTransformer) degreeRankingSize.getTransformer();
        degreeTransformer.setColors(new Color[]{new Color(0x8b92f9), new Color(0x329932)});
        degreeTransformer.setColorPositions(new float[]{0f, 1f});
        degreeTransformerSize.setMinSize(20);
        degreeTransformerSize.setMaxSize(50);
        appearanceController.transform(degreeRanking);
        appearanceController.transform(degreeRankingSize);
        System.out.println("Ranking done");
        
 	 	//Run YifanHuLayout for 100 passes - The layout always takes the current visible view
 	 	YifanHuLayout layout = new YifanHuLayout(null, new StepDisplacement(1f));
 	 	layout.setGraphModel(graphModel);
 	 	layout.resetPropertiesValues();
 	 	layout.setOptimalDistance(200f);
 	 	layout.setRelativeStrength(0.5f);
 	 	layout.initAlgo();
 	 	for (int i = 0; i < 5000 && layout.canAlgo(); i++){
 	 		layout.goAlgo(); 
 	 	}
 	 	System.out.println("Layout done");
 	 	ExportController ec = Lookup.getDefault().lookup(ExportController.class);
        try {
            ec.exportFile(new File(filename));
        } catch (IOException ex) {
            ex.printStackTrace();
            return;
        }

        //Export only visible graph
        /*GraphExporter exporter = (GraphExporter) ec.getExporter("gexf");     //Get GEXF exporter
        exporter.setExportVisible(true);  //Only exports the visible (filtered) graph
        exporter.setWorkspace(workspace);
        try {
            ec.exportFile(new File(filename), exporter);
        } catch (IOException ex) {
            ex.printStackTrace();
            return;
        }*/
	}
}
