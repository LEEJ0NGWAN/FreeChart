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
                    owner_id=request.user.id,
                    deleted=False).first()

            if not board:
                return JsonResponse({}, status=HTTP_404_NOT_FOUND)
            
            return JsonResponse(serialize({
                'board': board
            }))
        
        order = data.get('order', '-modify_date')
        if order not in [
            '-modify_date', '-create_date','-title',
            'modify_date','create_date','title']:
            order = '-modify_date'

        if 'parent_id' in data:
            boards = Board.objects\
                .filter(
                    owner_id=request.user.id,
                    parent_id=data['parent_id'],
                    deleted=False)\
                .order_by(order).all()
        
        else:
            boards = Board.objects\
                .filter(
                    owner_id=request.user.id,
                    deleted=False)\
                .order_by(order).all()

        return JsonResponse(serialize({
            'boards': boards
        }))

    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = json.loads(request.body.decode("utf-8"))
        
        new_board = Board.objects.create(
            title=data.get('title'),
            owner_id=request.user.id,
            parent_id=data.get('parent_id')
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
                owner_id=request.user.id,
                deleted=False).first()
        
        if not board:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)
        
        if 'title' in data:
            board.title = data['title']
        
        if 'parent_id' in data:
            board.parent_id = data['parent_id']

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
                owner_id=request.user.id,
                deleted=False).first()
        
        if not board:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)
        
        board.deleted = True
        board.save()

        if data.get('save_child'):
            boards = Board.objects\
                .filter(
                    parent=board,
                    deleted=False).all()

            sheets = Sheet.objects\
                .filter(
                    board=board,
                    deleted=False).all()
            
            response = serialize({
                'parent': board,
                'boards': boards,
                'sheets': sheets
            }, 
            change_parent=True,
            new_parent_id=board.parent_id)

            boards.update(parent_id=board.parent_id)
            sheets.update(board_id=board.parent_id)

            return JsonResponse(response)

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
                    owner_id=request.user.id,
                    deleted=False).first()
            
            if not sheet:
                return JsonResponse({}, status=HTTP_404_NOT_FOUND)
            
            return JsonResponse(serialize({
                'sheet': sheet
            }))

        order = data.get('order', '-modify_date')
        if order not in [
            '-modify_date', '-create_date','-title',
            'modify_date','create_date','title']:
            order = '-modify_date'
        
        if 'board_id' in data:
            sheets = Sheet.objects\
                .filter(
                    board_id=data['board_id'],
                    owner_id=request.user.id,
                    deleted=False)\
                .order_by(order).all()
        
        else:
            sheets = Sheet.objects\
                .filter(
                    owner_id=request.user.id,
                    deleted=False)\
                .order_by(order).all()
        
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
                deleted=False).first()
        
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
                label=data['nodes'][node_id]['label']))
            else:
                nodes[UUID(node_id)].label = data['nodes'][node_id]['label']
                nodes[UUID(node_id)].modify = now

        nodes = list(nodes.values())
        Node.objects.bulk_update(nodes,['label','deleted','modify'])
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
                    node_to_id=edge['to']))
            else:
                edge = data['edges'][edge_id]
                edges[UUID(edge_id)].node_from_id = edge['from']
                edges[UUID(edge_id)].node_to_id = edge['to']
                edges[UUID(edge_id)].modify = now
        
        edges = list(edges.values())
        Edge.objects.bulk_update(
            edges,['node_from_id', 'node_to_id', 'deleted','modify'])
        Edge.objects.bulk_create(new_edges)

        return JsonResponse({})

@method_decorator(csrf_exempt, name='dispatch')
class ChildController(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        data = request.GET

        parent = None
        if 'id' in data:
            board = Board.objects\
                .filter(
                    id=data['id'],
                    owner_id=request.user.id,
                    deleted=False).first()
            
            if not board:
                return JsonResponse({}, status=HTTP_404_NOT_FOUND)
            
            parent = board

        order = data.get('order', '-modify_date')
        if order not in [
            '-modify_date', '-create_date','-title',
            'modify_date','create_date','title']:
            order = '-modify_date'
        
        boards = Board.objects\
            .filter(
                owner_id=request.user.id,
                parent_id=data.get('id'),
                deleted=False)\
            .order_by(order).all()
        
        sheets = Sheet.objects\
            .filter(
                owner_id=request.user.id,
                board_id=data.get('id'),
                deleted=False)\
            .order_by(order).all()

        return JsonResponse(serialize({
            'parent': parent,
            'boards': boards,
            'sheets': sheets
        }))

