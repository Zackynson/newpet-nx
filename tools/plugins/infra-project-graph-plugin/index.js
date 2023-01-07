const { ProjectGraphBuilder } = require('@nrwl/devkit');

exports.processProjectGraph = (graph, context) => {
	const builder = new ProjectGraphBuilder(graph);

	const nodes = Object.values(builder.graph.nodes);

	for (const node of nodes) {
		if (node.type !== 'app') continue;
		// All apps will depend on the infra project
		builder.addImplicitDependency(node.name, 'infra');
		// infra project should not depend on app nodes
		builder.removeDependency('infra', node.name);
	}

	// We will see how this is used below.
	return builder.getUpdatedProjectGraph();
};
