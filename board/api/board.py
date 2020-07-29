import json
import datetime
from uuid import UUID
from django.contrib.auth import (
    login, logout
)
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View
from rest_framework.status import (
    HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND, HTTP_409_CONFLICT
)
from board.models import ( Board, Sheet, Node, Edge )
from utils.serialize import serialize

@method_decorator(csrf_exempt, name='dispatch')
class BoardController(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        data = request.GET

        if 'id' in data:
            board = Board.objects\
                .filter(
                    id=data['id'],
                    deleted=False).first()

            if not board:
                return JsonResponse({}, status=HTTP_404_NOT_FOUND)
            
            return JsonResponse(serialize({
                'board': board
            }))
        
        if 'owner_id' in data:
            boards = Board.objects\
                .filter(
                    owner_id=data['owner_id'],
                    deleted=False)\
                .order_by('modify_date').all()

            return JsonResponse(serialize({
                'boards': boards
            }))
        
        else:
            boards = Board.objects\
                .filter(
                    owner_id=request.user.id,
                    deleted=False)\
                .order_by('modify_date').all()
            
            sheets = Sheet.objects\
                .filter(
                    owner_id=request.user.id,
                    board=None,
                    deleted=False)\
                .order_by('modify_date').all()

            return JsonResponse(serialize({
                'boards': boards,
                'sheets': sheets
            }))

    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = json.loads(request.body.decode("utf-8"))

        title = data.get('title')
        
        new_board = Board.objects.create(
            title=title,
            owner_id=request.user.id
        )

        return JsonResponse(serialize({
            'board': new_board
        }))

    def put(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = json.loads(request.body.decode("utf-8"))

        if 'id' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
        board = Board.objects\
            .filter(
                id=data.get('id'),
                deleted=False).first()
        
        if not board:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)
        
        board.title = data.get('title')
        board.save()

        return JsonResponse(serialize({
            'board': board
        }))

    def delete(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = request.GET
        
        if 'id' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
        board = Board.objects\
            .filter(
                id=data['id'],
                deleted=False).first()
        
        if not board:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)
        
        board.deleted = True
        board.save()

        if data.get('save_sheets', False):
            Sheet.objects\
                .filter(
                    board=board,
                    deleted=False).all()\
                .update(board=None)

        return JsonResponse(serialize({
            'board': board
        }))

@method_decorator(csrf_exempt, name='dispatch')
class SheetController(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        data = request.GET

        if 'id' in data:
            sheet = Sheet.objects\
                .filter(
                    id=data['id'],
                    deleted=False).first()
            
            if not sheet:
                return JsonResponse({}, status=HTTP_404_NOT_FOUND)
            
            return JsonResponse(serialize({
                'sheet': sheet
            }))
        
        if 'board_id' in data:
            sheets = Sheet.objects\
                .filter(
                    board_id=data['board_id'],
                    deleted=False)\
                .order_by('modify_date').all()
        
        else:
            sheets = Sheet.objects\
                .filter(
                    owner_id=request.user.id,
                    deleted=False)\
                .order_by('modify_date').all()
        
        if not sheets:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)
        
        return JsonResponse(serialize({
            'sheets': sheets
        }))
        
    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = json.loads(request.body.decode("utf-8"))
        
        new_sheet = Sheet.objects.create(
            title=data.get('title'),
            board_id=data.get('board_id'),
            owner_id=request.user.id
        )

        return JsonResponse(serialize({
            'sheet': new_sheet
        }))

    def put(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = json.loads(request.body.decode("utf-8"))

        if 'id' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
        sheet = Sheet.objects\
            .filter(
                id=data.get('id'),
                owner_id=request.user.id,
                deleted=False).fisrt()
        
        if not sheet:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)

        if 'title' in data:
            sheet.title = data.get('title')
        
        if 'board_id' in data:
            sheet.board_id = data.get('board_id')
        
        sheet.save()

        return JsonResponse(serialize({
            'sheet': sheet
        }))

    def delete(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = request.GET

        if 'id' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
        sheet = Sheet.objects\
            .filter(
                id=data['id'],
                owner_id=request.user.id,
                deleted=False).first()
        
        if not sheet:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)
        
        sheet.deleted = True
        sheet.save()

        return JsonResponse(serialize({
            'sheet': sheet
        }))

@method_decorator(csrf_exempt, name='dispatch')
class ElementController(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        data = request.GET

        if 'sheet_id' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
        nodes = Node.objects\
            .filter(
                sheet_id=data['sheet_id'],
                deleted=False)\
            .order_by('id').all()
        
        edges = Edge.objects\
            .filter(
                sheet_id=data['sheet_id'],
                deleted=False)\
            .order_by('id').all()
        
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
        
        sheet = Sheet.objects\
            .filter(
                id=data['sheet_id'],
                owner_id=request.user.id,
                deleted=False).first()
        
        if not sheet:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)

        sheet_id = data['sheet_id']

        new_nodes = list()
        new_app = new_nodes.append

        # 0: del, 1: crt, 2: mod
        nodes = Node.objects.in_bulk(list(data['nodeStates'].keys()))

        for node_id in data['nodeStates']:
            state = data['nodeStates'][node_id]
            if not state:
                nodes[UUID(node_id)].deleted = True
            elif (state == 1):
                new_app(Node(
                id=node_id,
                sheet_id=sheet_id,
                label=data['nodes'][node_id]['label']))
            else:
                nodes[UUID(node_id)].label = data['nodes'][node_id]['label']

        nodes = list(nodes.values())
        Node.objects.bulk_update(nodes,['label','deleted'])
        Node.objects.bulk_create(new_nodes)

        new_edges = list()
        new_app = new_edges.append

        edges = Edge.objects.in_bulk(list(data['edgeStates'].keys()))

        for edge_id in data['edgeStates']:
            state = data['edgeStates'][edge_id]
            if not state:
                edges[UUID(edge_id)].deleted = True
            elif (state == 1):
                edge = data['edges'][edge_id]
                new_app(Edge(
                    id=edge_id,
                    sheet_id=sheet_id,
                    label=edge['label'],
                    node_from_id=edge['from'],
                    node_to_id=edge['to']))
            else:
                edge = data['edges'][edge_id]
                edges[UUID(edge_id)].node_from_id = edge['from']
                edges[UUID(edge_id)].node_to_id = edge['to']
        
        edges = list(edges.values())
        Edge.objects.bulk_update(edges,['node_from_id', 'node_to_id', 'deleted'])
        Edge.objects.bulk_create(new_edges)

        return JsonResponse({})

