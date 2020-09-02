from random import choice as random_choice
from string import ascii_uppercase, digits
from redis import StrictRedis
import FreeChart.settings as settings

from board.models import Board, Sheet, Node, Edge
import board.default_data as default_data

default_data_size = len(default_data.nodeDataSet)

redis = StrictRedis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    charset="utf-8",
    decode_responses=True
)

def id_generator(size=32, chars=ascii_uppercase + digits):
    return ''.join(random_choice(chars) for _ in range(size))

def setDataOnSheet(data_id, sheet_id):
    if data_id < 0 or default_data_size <= data_id:
        return
    
    node_data_name = default_data.nodeDataSet[data_id]
    node_data = default_data.__dict__[node_data_name]
    edge_data_name = default_data.edgeDataSet[data_id]
    edge_data = default_data.__dict__[edge_data_name]


    node_parse = {}

    new_nodes, new_edges = [], []
    new_nodes_app = new_nodes.append
    new_edges_app = new_edges.append

    for data in node_data:
        node = Node(
            sheet_id=sheet_id,
            label=data[1],
            x=data[2],
            y=data[3],
            font=data[4],
            shape=data[5],
            color=data[6]
        )
        node_parse[data[0]] = node.id
        new_nodes_app(node)

    for data in edge_data:
        edge = Edge(
            sheet_id=sheet_id,
            label=data[0],
            node_from_id=node_parse[data[1]],
            node_to_id=node_parse[data[2]],
            dashes=data[3],
            width=data[4],
            arrow=data[5]
        )
        new_edges_app(edge)

    Node.objects.bulk_create(new_nodes)
    Edge.objects.bulk_create(new_edges)

    return

def SetDefaultData(user_id):    
    if not default_data_size:
        return

    sheet = Sheet.objects.create(
        title=default_data.nameList[0],
        owner_id=user_id,
        board_id=None
    )
    setDataOnSheet(0,sheet.id)

    if default_data_size > 1:
        board = Board.objects.create(
            title='예제',
            owner_id=user_id
        )

        for index in range(1,default_data_size):
            sheet = Sheet.objects.create(
                title=default_data.nameList[index],
                owner_id=user_id,
                board_id=board.id
            )
            setDataOnSheet(index,sheet.id)

