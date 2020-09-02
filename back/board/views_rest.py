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
from rest_framework.views import APIView
from board.models import ( Board, Sheet, Node, Edge )
from utils.serialize import serialize

@method_decorator(csrf_exempt, name='dispatch')
class ChildController(APIView):
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

@method_decorator(csrf_exempt, name='dispatch')
class SheetCopy(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        data = json.loads(request.body.decode("utf-8"))

        if 'sheet_id' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
        sheet = Sheet.objects\
            .filter(
                id=data['sheet_id'],
                owner_id=request.user.id,
                deleted=False).first()
        
        if not sheet:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)
        
        title_ = \
            sheet.title +'(복사본) '+ str(datetime.datetime.now())[:19]

        copied_sheet = Sheet.objects.create(
            title=title_,
            board_id=sheet.board_id,
            owner_id=request.user.id
        )

        node_values = Node.objects\
            .filter(
                sheet_id=sheet.id,
                deleted=False)\
            .values('id','label','x','y','font','shape','color')

        edge_values = Edge.objects\
            .filter(
                sheet_id=sheet.id,
                deleted=False)\
            .values('label','node_from','node_to','dashes','width','arrow')
        
        node_parse = {}

        new_nodes, new_edges = [], []
        new_nodes_app = new_nodes.append
        new_edges_app = new_edges.append
        
        for val in node_values:
            node = Node(
                sheet_id=copied_sheet.id, 
                label=val['label'],
                x=val['x'],
                y=val['y'],
                font=val['font'],
                shape=val['shape'],
                color=val['color'])
            
            new_nodes_app(node)
            node_parse[str(val['id'])] = node.id
        
        for val in edge_values:
            from_id = str(val['node_from'])
            to_id = str(val['node_to'])

            if from_id not in node_parse\
            or to_id not in node_parse:
                continue

            edge = Edge(
                sheet_id=copied_sheet.id,
                node_from_id=node_parse[from_id],
                node_to_id=node_parse[to_id],
                label=val['label'],
                dashes=val['dashes'],
                width=val['width'],
                arrow=val['arrow'])

            new_edges_app(edge)

        Node.objects.bulk_create(new_nodes)
        Edge.objects.bulk_create(new_edges)

        return JsonResponse({})

# util
# @method_decorator(csrf_exempt, name='dispatch')
# class GetDefaultData(View):
#     def get(self, request):
#         '''
#         data = {
#             sheet_name: sheet_id, # welcome Sheet
#             sheet_name: sheet_id, # example Sheet
#             sheet_name: sheet_id, # example Sheet
#             ...                   # example Sheet
#         }
#         '''
#         data = request.GET

#         if not len(data):
#             return JsonResponse({})

#         data_file = open("./board/default_data.py", 'w')

#         node_index = 0
#         node_parse = {}

#         sheet_ids = []
#         sheet_names = {}

#         node_data_info = []
#         edge_data_info = []

#         for name in data:
#             sheet_id = int(data[name])
#             sheet_ids.append(sheet_id)
#             sheet_names[sheet_id] = name

#         for sheet_id in sheet_ids:
#             data_name = sheet_names[sheet_id]+'_nodes'
#             data_file.write(data_name+' = [\n')
#             node_data_info.append(data_name)

#             node_values = Node.objects\
#                 .filter(
#                     sheet_id=sheet_id,
#                     deleted=False)\
#                 .values('id','label','x','y','font','shape','color')

#             for node in node_values:
#                 target = [
#                     node_index, 
#                     node['label'],
#                     node['x'], node['y'],
#                     node['font'],
#                     node['shape'],
#                     node['color'],]
#                 data_file.write('\t'+str(target)+',\n')

#                 node_parse[str(node['id'])] = node_index
#                 node_index += 1
                
#             data_file.write(']\n\n')

#             data_name = sheet_names[sheet_id]+'_edges'
#             data_file.write(data_name+' = [\n')
#             edge_data_info.append(data_name)

#             edge_values = Edge.objects\
#                 .filter(
#                     sheet_id=sheet_id,
#                     deleted=False)\
#                 .values('label','node_from','node_to','dashes','width','arrow')

#             for edge in edge_values:
#                 from_id = str(edge['node_from'])
#                 to_id = str(edge['node_to'])
#                 target = [
#                     edge['label'],
#                     node_parse[from_id],
#                     node_parse[to_id],
#                     edge['dashes'],
#                     edge['width'],
#                     edge['arrow'],]
#                 data_file.write('\t'+str(target)+',\n')

#             data_file.write(']\n\n')
        
#         data_file.write('nodeDataSet = '+str(node_data_info)+'\n')
#         data_file.write('edgeDataSet = '+str(edge_data_info)+'\n')
#         data_file.write('nameList = '+str(list(data.keys()))+'\n')

#         data_file.write('\n\n')


#         return JsonResponse({})

