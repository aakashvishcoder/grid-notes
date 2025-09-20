import React, { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  applyNodeChanges,
} from "reactflow";
import "reactflow/dist/style.css";

export function GraphView({ pages, setPages, onSelectPage }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [hoverNode, setHoverNode] = useState(null);

  // Build nodes and edges whenever pages change
  useEffect(() => {
    const newNodes = pages.map((p, i) => ({
      id: p.id,
      data: { label: p.title },
      position:
        p.position || { x: 200 * (i % 5), y: 100 * Math.floor(i / 5) },
      style: {
        background: "#444654",
        color: "white",
        borderRadius: 6,
        padding: 10,
      },
    }));

    const newEdges = [];
    pages.forEach((p) => {
      p.links?.forEach((linkId) => {
        newEdges.push({
          id: `${p.id}-${linkId}`,
          source: p.id,
          target: linkId,
          animated: true,
          style: { stroke: "#10a37f" },
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [pages]);

  // Persist node position when dragged
  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        const newNodes = applyNodeChanges(changes, nds);

        // Save updated positions back to pages
        changes.forEach((change) => {
          if (change.type === "position" && change.position) {
            setPages((prev) =>
              prev.map((p) =>
                p.id === change.id ? { ...p, position: change.position } : p
              )
            );
          }
        });

        return newNodes;
      });
    },
    [setPages]
  );

  const onNodeDoubleClick = useCallback(
    (_, node) => {
      onSelectPage(node.id);
    },
    [onSelectPage]
  );

  const onConnect = (params) => {
    setEdges((eds) =>
      addEdge({ ...params, animated: true, style: { stroke: "#10a37f" } }, eds)
    );
    setPages((prevPages) =>
      prevPages.map((p) =>
        p.id === params.source
          ? { ...p, links: [...new Set([...(p.links || []), params.target])] }
          : p
      )
    );
  };

  const onSelectionChange = (selection) =>
    setSelectedNodes(selection.nodes?.map((n) => n.id) || []);

  const connectSelectedNodes = () => {
    const newEdges = [];
    for (let i = 0; i < selectedNodes.length; i++) {
      for (let j = i + 1; j < selectedNodes.length; j++) {
        newEdges.push({
          id: `${selectedNodes[i]}-${selectedNodes[j]}`,
          source: selectedNodes[i],
          target: selectedNodes[j],
          animated: true,
          style: { stroke: "#10a37f" },
        });
      }
    }
    setEdges((prev) => [...prev, ...newEdges]);
    setPages((prevPages) =>
      prevPages.map((p) =>
        selectedNodes.includes(p.id)
          ? {
              ...p,
              links: [
                ...(p.links || []),
                ...selectedNodes.filter((id) => id !== p.id),
              ],
            }
          : p
      )
    );
  };

  const onNodeMouseEnter = (e, node) => {
    const page = pages.find((p) => p.id === node.id);
    setHoverNode({ ...page, x: e.clientX, y: e.clientY });
  };

  const onNodeMouseLeave = () => setHoverNode(null);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <button
        onClick={connectSelectedNodes}
        style={{
          position: "absolute",
          zIndex: 200,
          padding: "8px",
          background: "#10a37f",
          color: "white",
          borderRadius: "6px",
          border: "none",
        }}
      >
        Connect Selected Nodes
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange} // 👈 enables dragging and persistence
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        fitView
        style={{ background: "#343541" }}
        connectionLineStyle={{ stroke: "#10a37f", strokeWidth: 2 }}
        snapToGrid
        snapGrid={[15, 15]}
      >
        <MiniMap
          nodeStrokeColor={() => "#10a37f"}
          nodeColor={() => "#444654"}
          nodeBorderRadius={6}
        />
        <Controls />
        <Background color="#555" gap={16} />
      </ReactFlow>

      {hoverNode && (
        <div
          style={{
            position: "fixed",
            top: hoverNode.y + 10,
            left: hoverNode.x + 10,
            backgroundColor: "#444654",
            padding: "10px",
            borderRadius: "8px",
            maxWidth: "300px",
            color: "white",
            zIndex: 1000,
          }}
        >
          <strong>{hoverNode.title}</strong>
          <ul>
            {hoverNode.links?.map((id) => {
              const linkedPage = pages.find((p) => p.id === id);
              return <li key={id}>{linkedPage?.title}</li>;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
