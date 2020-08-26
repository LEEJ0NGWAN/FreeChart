import json
import datetime
from uuid import UUID
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View
from rest_framework.status import (
    HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND, HTTP_409_CONFLICT
)
from board.models import ( Sheet, Node, Edge )
from utils.serialize import serialize
  
@method_decorator(csrf_exempt, name='dispatch')
class ElementController(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        data = request.GET

        if 'sheet_id' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
        if not Sheet.objects\
            .filter(id=data['sheet_id'],
            owner_id=request.user.id,deleted=False).exists():
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)
        
        nodes = Node.objects\
            .filter(
                sheet_id=data['sheet_id'],
                deleted=False).all()
        
        edges = Edge.objects\
            .filter(
                sheet_id=data['sheet_id'],
                deleted=False).all()
        
        return JsonResponse(serialize({
            'nodes': nodes,
            'edges': edges
        }))

    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = json.loads(request.body.decode("utf-8"))

        if 'sheet_id' not in data \
        or 'nodes' not in data or 'edges' not in data\
        or 'nodeStates' not in data or 'edgeStates' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)

        sheet_id = data['sheet_id']

        if not Sheet.objects\
            .filter(id=data['sheet_id'],
            owner_id=request.user.id,deleted=False).exists():
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)

        now = datetime.datetime.now()

        new_nodes = list()
        new_app = new_nodes.append

        # 0: del, 1: crt, 2: mod
        nodes = Node.objects.in_bulk(list(data['nodeStates'].keys()))
        for node_id in data['nodeStates']:
            state = data['nodeStates'][node_id]
            if not state:
                nodes[UUID(node_id)].deleted = True
                nodes[UUID(node_id)].modify = now
            elif (state == 1):
                new_app(Node(
                id=node_id,
                sheet_id=sheet_id,
                label=data['nodes'][node_id]['label'],
                x=data['nodes'][node_id]['x_'],
                y=data['nodes'][node_id]['y_'],
                font=data['nodes'][node_id]['font'],
                shape=data['nodes'][node_id]['shape'],
                color=data['nodes'][node_id]['color']))
            else:
                nodes[UUID(node_id)].label = data['nodes'][node_id]['label']
                nodes[UUID(node_id)].x = data['nodes'][node_id]['x_']
                nodes[UUID(node_id)].y = data['nodes'][node_id]['y_']
                nodes[UUID(node_id)].font = data['nodes'][node_id]['font']
                nodes[UUID(node_id)].shape = data['nodes'][node_id]['shape']
                nodes[UUID(node_id)].color = data['nodes'][node_id]['color']
                nodes[UUID(node_id)].modify = now

        nodes = list(nodes.values())
        Node.objects.bulk_update(
            nodes,
            ['label','deleted','modify','x','y','font','shape','color'])
        Node.objects.bulk_create(new_nodes)

        new_edges = list()
        new_app = new_edges.append

        edges = Edge.objects.in_bulk(list(data['edgeStates'].keys()))

        for edge_id in data['edgeStates']:
            state = data['edgeStates'][edge_id]
            if not state:
                edges[UUID(edge_id)].deleted = True
                edges[UUID(edge_id)].modify = now
            elif (state == 1):
                edge = data['edges'][edge_id]
                new_app(Edge(
                    id=edge_id,
                    sheet_id=sheet_id,
                    label=edge['label'],
                    node_from_id=edge['from'],
                    node_to_id=edge['to'],
                    dashes=edge['dashes'],
                    width=edge['width'],
                    arrow=edge['arrow']))
            else:
                edge = data['edges'][edge_id]
                edges[UUID(edge_id)].label = edge['label']
                edges[UUID(edge_id)].node_from_id = edge['from']
                edges[UUID(edge_id)].node_to_id = edge['to']
                edges[UUID(edge_id)].dashes = edge['dashes']
                edges[UUID(edge_id)].width = edge['width']
                edges[UUID(edge_id)].arrow = edge['arrow']
                edges[UUID(edge_id)].modify = now
        
        edges = list(edges.values())
        Edge.objects.bulk_update(
            edges,
            [
                'node_from_id',
                'node_to_id',
                'deleted',
                'modify',
                'dashes',
                'arrow',
                'width',
                'label',
            ])
        Edge.objects.bulk_create(new_edges)

        return JsonResponse({})

