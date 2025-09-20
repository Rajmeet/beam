from beam import endpoint

@endpoint(name="hello-world")
def handler(**inputs):
    x = inputs.get("x", 256)
    return {"result": x**2}
