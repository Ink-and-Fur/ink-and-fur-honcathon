docker_build("api", "api")
k8s_yaml('k8s.yaml')
k8s_resource('api', port_forwards=8000)

docker_build("frontend", "frontend", live_update=[
    sync("frontend/src", "/app/src")
])
k8s_yaml('frontend.yaml')
k8s_resource('frontend', port_forwards=5173, )