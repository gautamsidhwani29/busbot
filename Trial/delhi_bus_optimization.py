import json
import math
from ortools.constraint_solver import routing_enums_pb2, pywrapcp

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c * 1000  # Convert km to meters

def get_distance_matrix(bus_stops):
    num_stops = len(bus_stops)
    distance_matrix = [[0] * num_stops for _ in range(num_stops)]
    
    for i in range(num_stops):
        for j in range(num_stops):
            if i != j:
                distance_matrix[i][j] = haversine(
                    bus_stops[i]['lat'], bus_stops[i]['lng'],
                    bus_stops[j]['lat'], bus_stops[j]['lng']
                )
    return distance_matrix

def solve_vrp(bus_stops):
    distance_matrix = get_distance_matrix(bus_stops)
    manager = pywrapcp.RoutingIndexManager(len(distance_matrix), 1, 0)
    routing = pywrapcp.RoutingModel(manager)
    
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return int(distance_matrix[from_node][to_node])
    
    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
    
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    
    solution = routing.SolveWithParameters(search_parameters)
    
    if solution:
        index = routing.Start(0)
        route = []
        while not routing.IsEnd(index):
            route.append(bus_stops[manager.IndexToNode(index)])
            index = solution.Value(routing.NextVar(index))
        route.append(bus_stops[manager.IndexToNode(index)])
        return route
    else:
        return []

bus_stops = [
    {"lat": 28.7041, "lng": 77.1025},
    {"lat": 28.5355, "lng": 77.3910},
    {"lat": 28.4595, "lng": 77.0266},
    {"lat": 28.6139, "lng": 77.2090}
]

optimized_route = solve_vrp(bus_stops)
with open("optimized_route.json", "w") as f:
    json.dump(optimized_route, f)

print("Optimized route saved to optimized_route.json")

