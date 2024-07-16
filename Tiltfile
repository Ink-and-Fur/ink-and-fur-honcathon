docker_build("api", "api")
k8s_yaml('k8s.yaml')
k8s_resource('api', port_forwards=8000)
