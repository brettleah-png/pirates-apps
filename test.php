<!-- Button trigger modal -->
<button  type="button" data-mdb-button-init data-mdb-ripple-init class="btn btn-primary" data-mdb-modal-init data-mdb-target="#staticBackdrop1">
    Launch modal login form
</button>


<!-- Modal -->
<div class="modal fade" id="staticBackdrop1" tabindex="-1" aria-labelledby="exampleModalLabel1" aria-hidden="true">
    <div class="modal-dialog d-flex justify-content-center">
        <div class="modal-content w-75">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel1">Sign in</h5>
                <button  type="button" data-mdb-button-init data-mdb-ripple-init class="btn-close" data-mdb-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
                <form>
                    <!-- Email input -->
                    <div data-mdb-input-init class="form-outline mb-4">
                        <input type="email" id="email1" class="form-control" />
                        <label class="form-label" for="email1">Email address</label>
                    </div>

                    <!-- password input -->
                    <div data-mdb-input-init class="form-outline mb-4">
                        <input type="password" id="password1" class="form-control" />
                        <label class="form-label" for="password1">Password</label>
                    </div>

                    <!-- Submit button -->
                    <button type="submit" data-mdb-button-init data-mdb-ripple-init class="btn btn-primary btn-block">Login</button>
                </form>
            </div>
        </div>
    </div>
</div>
<!-- Modal -->