function iniciarApp() {

    const selectCategoria = document.querySelector('#categoria-select')
    const resultadoDiv = document.querySelector('#resultado')
    const modal = document.querySelector('#modal')



    if (selectCategoria) {
        selectCategoria.addEventListener('change', obtenerRecetas)
        obtenerCategoria()
    }

    const favoritoDiv = document.querySelector('.favoritos')

    if (favoritoDiv) {
        obtenerFavoritos()
    }

    function obtenerCategoria() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarCategoria(resultado.categories))
    }



    function obtenerRecetas(e) {

        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${e.target.value}`

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetas(resultado.meals))
    }

    function obtenerReceta(id) {
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => recetaModal(resultado.meals[0]))
    }

    function mostrarCategoria(categorias) {

        categorias.forEach(categoria => {
            const { strCategory } = categoria
            const option = document.createElement('OPTION')
            option.value = strCategory
            option.textContent = strCategory

            selectCategoria.appendChild(option)
        });
    }

    function mostrarRecetas(recetas = []) {

        limpiarHtml(resultadoDiv)

        recetas.forEach(receta => {

            const { idMeal, strMeal, strMealThumb } = receta


            const recetaDiv = document.createElement('DIV')
            recetaDiv.classList.add('w-full')

            const recetaBody = document.createElement('DIV')
            recetaBody.classList.add('m-8', 'md:m-4', 'xl:m-2', 'border', 'rounded-md', '2xl:m-6')

            const imgReceta = document.createElement('IMG')
            imgReceta.classList.add('rounded-md', 'w-full')
            imgReceta.src = strMealThumb ?? receta.imagen

            const receteFooter = document.createElement('DIV')
            receteFooter.classList.add('m-4')

            const tituloReceta = document.createElement('H3')
            tituloReceta.classList.add('text-2xl')
            tituloReceta.textContent = strMeal ?? receta.titulo

            const buttonFavoritos = document.createElement('BUTTON')
            buttonFavoritos.classList.add('bg-red-500', 'text-white', 'p-2', 'w-full', 'mt-2')
            buttonFavoritos.textContent = 'Ver receta'
            buttonFavoritos.onclick = function () {
                mostrarReceta(idMeal ?? receta.id)
            }

            receteFooter.appendChild(tituloReceta)
            receteFooter.appendChild(buttonFavoritos)
            recetaBody.appendChild(imgReceta)
            recetaBody.appendChild(receteFooter)
            recetaDiv.appendChild(recetaBody)
            resultadoDiv.appendChild(recetaDiv)

        });

        function mostrarReceta(id) {
            obtenerReceta(id)
        }
    }

    function recetaModal(receta) {

        const { idMeal, strMeal, strInstructions, strMealThumb } = receta

        const modalTitle = document.querySelector('#modal-title')
        const modalBody = document.querySelector('#body-modal')
        const modalFooter = document.querySelector('#footer-modal')


        modalTitle.textContent = strMeal
        modalBody.innerHTML =
            `
                                <img src="${strMealThumb}" alt="">
                                <p class="py-4">${strInstructions}</p>
                                <h4 class="font-bold pb-2">Ingredientes - Cantidad</h4>
                            `
        for (let i = 1; i < 20; i++) {
            if (receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`]
                const cantidad = receta[`strMeasure${i}`]
                const parrafoIngredienteCantidad = document.createElement('P')
                parrafoIngredienteCantidad.classList.add('w-full', 'border', 'text-center')
                parrafoIngredienteCantidad.textContent = `${ingrediente} - ${cantidad}`
                modalBody.appendChild(parrafoIngredienteCantidad)

            }

        }

        limpiarHtml(modalFooter)

        const btnFavoritos = document.createElement('BUTTON')
        btnFavoritos.classList.add("inline-flex", "w-full", "justify-center", "rounded-md", "bg-red-600", "px-3", "py-2", "text-sm", "font-semibold", "text-white", "shadow-sm", "hover:bg-red-500", "sm:ml-3", "sm:w-auto")
        btnFavoritos.textContent = existeFavorito(idMeal) ? 'Eliminar de favoritos' : 'Agregar a Favoritos'

        btnFavoritos.onclick = function () {

            if (existeFavorito(idMeal)) {

                eliminarFavoritos(idMeal)

                btnFavoritos.textContent = 'Agregar a Favoritos'

                mostrarToast('Eliminado Correctamente')

                obtenerFavoritos()

                return
            }
            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                imagen: strMealThumb
            })

            btnFavoritos.textContent = 'Eliminar de favoritos'

            mostrarToast('Agregado Correctamente')

            
        }

        const btnClose = document.createElement('BUTTON')
        btnClose.classList.add("mt-3", "inline-flex", "w-full", "justify-center", "rounded-md", "bg-white", "px-3", "py-2", "text-sm", "font-semibold", "text-gray-900", "shadow-sm", "ring-1", "ring-inset", "ring-gray-300", "hover:bg-gray-50", "sm:mt-0", "sm:w-auto")
        btnClose.textContent = 'Cerrar'
        btnClose.onclick = function () {
            modal.classList.add('hidden')
        }

        modalFooter.appendChild(btnClose)
        modalFooter.appendChild(btnFavoritos)

        modal.classList.remove('hidden')

    }

    function agregarFavorito(receta) {

        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []

        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]))
    }

    function eliminarFavoritos(id) {

        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []

        nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id)

        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos))
    }

    function existeFavorito(id) {

        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []

        return favoritos.some(favorito => favorito.id === id)


    }

    function mostrarToast(mensaje) {
        const toastSuccess = document.querySelector('#toast-success')
        const textToast = document.querySelector('#text-toast')
        textToast.textContent = mensaje
        toastSuccess.classList.remove('hidden')

        setTimeout(() => {
            toastSuccess.classList.add('hidden')
        }, 3000);

    }

    function obtenerFavoritos() {

        limpiarHtml(favoritoDiv)

        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []

        if (favoritos.length) {
            mostrarRecetas(favoritos)
            return
        }

        const noFavoritos = document.createElement('H3')
        noFavoritos.classList.add('text-center', 'col-span-3', 'text-2xl', 'font-bold')
        noFavoritos.textContent = 'No hay favoritos'
        favoritoDiv.appendChild(noFavoritos)

    }

    function limpiarHtml(referencia) {
        while (referencia.firstChild) {
            referencia.removeChild(referencia.firstChild)
        }
    }

}

window.addEventListener('DOMContentLoaded', iniciarApp)